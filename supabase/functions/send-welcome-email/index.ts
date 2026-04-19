import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// =============================================================================
// DELIVERY GUARANTEE LEVELS
// -----------------------------------------------------------------------------
//   accepted  — Resend API returned 2xx; message is in Resend's queue
//   queued    — Resend has accepted and is attempting delivery (same as accepted
//               from our perspective; Resend uses this terminology internally)
//   delivered — Resend webhook fired "email.delivered" (stored in email_delivery_log)
//   bounced   — Resend webhook fired "email.bounced" (hard or soft)
//   unknown   — No webhook received yet (normal for first few seconds)
//
// This function returns status "accepted". The resend-webhook edge function
// upgrades status to "delivered" or "bounced" as events arrive.
//
// IMPORTANT: "accepted" ≠ "delivered". Spam filters, invalid MX records, full
// mailboxes, or ISP blocks can prevent delivery after acceptance. Configure the
// Resend webhook (pointing to /functions/v1/resend-webhook) for authoritative
// delivery confirmation.
// =============================================================================

// =============================================================================
// CORS
// =============================================================================
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, X-Request-Id, Idempotency-Key",
};

// =============================================================================
// EMAIL VALIDATION — backend is authoritative
// -----------------------------------------------------------------------------
// Frontend (src/lib/emailValidation.ts) carries an identical copy for instant
// UX feedback only. This backend check always runs regardless of whether the
// frontend check was bypassed. Any change here MUST be mirrored in the frontend.
// =============================================================================
const EMAIL_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): { valid: true } | { valid: false; reason: string } {
  if (typeof email !== "string" || !email) return { valid: false, reason: "MISSING" };
  if (email.length > 320)               return { valid: false, reason: "TOO_LONG" };
  const atIdx = email.indexOf("@");
  if (atIdx < 1 || atIdx > 64)         return { valid: false, reason: "LOCAL_PART_INVALID" };
  if (/\.\./.test(email.slice(0, atIdx))) return { valid: false, reason: "CONSECUTIVE_DOTS_LOCAL" };
  if (/\.\./.test(email.slice(atIdx + 1))) return { valid: false, reason: "CONSECUTIVE_DOTS_DOMAIN" };
  if (!EMAIL_REGEX.test(email))         return { valid: false, reason: "REGEX_FAIL" };
  return { valid: true };
}

// =============================================================================
// STRUCTURED LOGGER
// -----------------------------------------------------------------------------
// Every line is a JSON object with: level, code, message, requestId,
// timestamp, service, plus arbitrary meta fields.
// Query by requestId in Supabase Edge Function logs to trace a full request.
// =============================================================================
type LogLevel = "info" | "warn" | "error";

function log(
  level: LogLevel,
  code: string,
  message: string,
  meta: Record<string, unknown> = {},
) {
  const entry = {
    level,
    code,
    message,
    timestamp: new Date().toISOString(),
    service: "send-welcome-email",
    ...meta,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// =============================================================================
// SHA-256 DIGEST
// =============================================================================
async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// =============================================================================
// DISTRIBUTED RATE LIMITER — Postgres-backed, concurrency-safe
// -----------------------------------------------------------------------------
// Uses a single-row upsert pattern in rate_limit_counters:
//   - Try to increment the counter for key within the current window.
//   - If the window has expired, reset count to 1 and start a new window.
//   - The INSERT ... ON CONFLICT DO UPDATE is atomic — safe under concurrent
//     isolates hitting the same Postgres row simultaneously.
//
// Keys:
//   "ip:<address>"    — 5 req / 60 s per IP
//   "email:<hash>"    — 1 req / 60 s per email (prevents duplicate sends
//                       even across isolate boundaries and retries without a
//                       client-supplied idempotency key)
// =============================================================================
const WINDOW_SECS = 60;
const IP_MAX      = 5;
const EMAIL_MAX   = 1;

type SupabaseAdmin = ReturnType<typeof createClient>;

async function checkRateLimit(
  db: SupabaseAdmin,
  key: string,
  max: number,
  requestId: string,
): Promise<{ allowed: boolean; count: number }> {
  const windowStart = new Date(
    Math.floor(Date.now() / (WINDOW_SECS * 1000)) * (WINDOW_SECS * 1000),
  ).toISOString();

  const { data, error } = await db.rpc("upsert_rate_limit_counter", {
    p_key: key,
    p_window_start: windowStart,
    p_max: max,
  });

  if (error) {
    log("warn", "RATE_LIMIT_DB_ERROR", "Rate limit DB call failed, allowing request", {
      requestId, key, error: error.message,
    });
    return { allowed: true, count: 0 };
  }

  const count = data as number;
  return { allowed: count <= max, count };
}

// =============================================================================
// IDEMPOTENCY — DB-backed, supports client-supplied keys
// -----------------------------------------------------------------------------
// Priority:
//   1. Client supplies "Idempotency-Key" header  → use as-is (sha256 it for storage)
//   2. Fallback → sha256(normalizedEmail)
//
// Key type is stored so logs/audits can distinguish the two cases.
//
// Client-supplied keys let callers safely retry a failed request without
// risking a duplicate send — the same key returns the cached response.
// A new idempotency key (or no key at all, triggering the email fallback)
// represents a genuinely new submission.
//
// TTL: 24 hours for client keys, 10 minutes for email-derived keys.
// This means:
//   - A user who submits, gets a network error, and retries within 24 h with
//     the same client key gets the cached "accepted" response — no dupe email.
//   - A user who waits > 10 min and resubmits without a client key will
//     re-trigger the flow (which is correct — they may want a new coupon send).
// =============================================================================
const CLIENT_KEY_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_KEY_TTL_MS  = 10 * 60 * 1000;

async function getIdempotentResponse(
  db: SupabaseAdmin,
  key: string,
  ttlMs: number,
): Promise<{ status: number; body: Record<string, unknown> } | null> {
  const cutoff = new Date(Date.now() - ttlMs).toISOString();
  const { data } = await db
    .from("idempotency_log")
    .select("status, body")
    .eq("key", key)
    .gte("created_at", cutoff)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status as number,
    body: data.body as Record<string, unknown>,
  };
}

async function saveIdempotentResponse(
  db: SupabaseAdmin,
  key: string,
  keyType: "client_supplied" | "email_derived",
  status: number,
  body: Record<string, unknown>,
  messageId: string | undefined,
): Promise<void> {
  const { error } = await db.from("idempotency_log").upsert(
    { key, key_type: keyType, status, body, message_id: messageId ?? null },
    { onConflict: "key" },
  );
  if (error) {
    log("warn", "IDEMPOTENCY_SAVE_FAILED", "Failed to persist idempotency record", {
      error: error.message,
    });
  }
}

// =============================================================================
// RESEND EMAIL SENDER
// -----------------------------------------------------------------------------
// Retry policy:
//   - Retries on: network errors, 429, 5xx
//   - Hard bail on: 400, 401, 403, 422 (retrying won't help)
//   - Backoff: exponential + full jitter → delay ∈ [0, base * 2^attempt]
//   - Respects Retry-After header from Resend 429 responses
//   - Max total budget: 8 s across all attempts
//
// The Idempotency-Key sent to Resend is derived from our requestId so Resend
// itself deduplicates even if we retry the same send attempt multiple times.
// =============================================================================
const MAX_RETRIES       = 2;
const BASE_DELAY_MS     = 400;
const MAX_DELAY_MS      = 4_000;
const TOTAL_TIMEOUT_MS  = 8_000;
const NON_RETRYABLE     = new Set([400, 401, 403, 422]);

interface ResendBody { id?: string; message?: string; name?: string; statusCode?: number; }
interface EmailResult { ok: boolean; id?: string; statusCode: number; body: ResendBody; }

function jitteredDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) return Math.min(retryAfterMs, MAX_DELAY_MS);
  const cap = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  return Math.random() * cap;
}

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; html: string },
  requestId: string,
): Promise<EmailResult> {
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (Date.now() >= deadline) {
      log("error", "EMAIL_TIMEOUT", "Retry budget exhausted", { requestId, attempt, to: payload.to });
      return { ok: false, statusCode: 0, body: { message: "Retry timeout" } };
    }

    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `${requestId}-a${attempt}-${payload.to[0]}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      const isLast = attempt === MAX_RETRIES;
      log(isLast ? "error" : "warn", "NETWORK_ERROR", "Resend network error", {
        requestId, attempt, retryable: !isLast, error: String(netErr),
      });
      if (isLast) return { ok: false, statusCode: 0, body: { message: String(netErr) } };
      await new Promise((r) => setTimeout(r, jitteredDelay(attempt)));
      continue;
    }

    let body: ResendBody = {};
    try { body = await res.json(); } catch { /* leave empty */ }

    if (res.ok) {
      log("info", "EMAIL_ACCEPTED", "Resend accepted message", {
        requestId, attempt, messageId: body.id, to: payload.to,
      });
      return { ok: true, id: body.id, statusCode: res.status, body };
    }

    const isLast = attempt === MAX_RETRIES;

    if (NON_RETRYABLE.has(res.status)) {
      log("error", "EMAIL_REJECTED", "Resend rejected message (non-retryable)", {
        requestId, statusCode: res.status, body,
      });
      return { ok: false, statusCode: res.status, body };
    }

    let retryAfterMs: number | undefined;
    const ra = res.headers.get("retry-after");
    if (ra) {
      const secs = parseFloat(ra);
      if (!isNaN(secs)) retryAfterMs = secs * 1000;
    }

    log(isLast ? "error" : "warn", "EMAIL_RETRYABLE_ERROR", "Resend returned retryable error", {
      requestId, attempt, maxRetries: MAX_RETRIES, statusCode: res.status,
      body, retryAfterMs, willRetry: !isLast,
    });

    if (!isLast) await new Promise((r) => setTimeout(r, jitteredDelay(attempt, retryAfterMs)));
  }

  return { ok: false, statusCode: 0, body: { message: "Max retries exceeded" } };
}

// =============================================================================
// HELPERS
// =============================================================================
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}

// =============================================================================
// MAIN HANDLER
// =============================================================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS });
  }

  const requestId =
    req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // ── Parse body ────────────────────────────────────────────────────────────
    let rawEmail: unknown;
    try {
      const body = await req.json();
      rawEmail = body?.email;
    } catch {
      return jsonResponse(
        { error: "Invalid JSON body", code: "INVALID_JSON" },
        400, { "X-Request-Id": requestId },
      );
    }

    // ── Validation (backend is source of truth) ───────────────────────────────
    const validation = validateEmail(rawEmail as string);
    if (!validation.valid) {
      log("warn", "VALIDATION_ERROR", "Email validation failed", {
        requestId, reason: validation.reason,
      });
      return jsonResponse(
        { error: "Invalid email address", code: "VALIDATION_ERROR" },
        400, { "X-Request-Id": requestId },
      );
    }

    const email = (rawEmail as string).trim().toLowerCase();

    // ── IP rate limit (distributed, Postgres-backed) ──────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipRl = await checkRateLimit(db, `ip:${ip}`, IP_MAX, requestId);
    if (!ipRl.allowed) {
      log("warn", "RATE_LIMITED", "IP rate limit exceeded", {
        requestId, ip, count: ipRl.count, max: IP_MAX,
      });
      return jsonResponse(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
        429, { "X-Request-Id": requestId, "Retry-After": String(WINDOW_SECS) },
      );
    }

    // ── Per-email rate limit (prevents concurrent duplicate sends cross-isolate)
    const emailHash = await sha256hex(email);
    const emailRl = await checkRateLimit(db, `email:${emailHash}`, EMAIL_MAX, requestId);
    if (!emailRl.allowed) {
      log("warn", "DUPLICATE_SUBMISSION", "Email rate limited within window", {
        requestId, count: emailRl.count,
      });
      return jsonResponse(
        {
          error: "This email was recently submitted. Please wait before trying again.",
          code: "DUPLICATE_SUBMISSION",
        },
        429, { "X-Request-Id": requestId, "Retry-After": String(WINDOW_SECS) },
      );
    }

    // ── Idempotency key resolution ────────────────────────────────────────────
    // Client-supplied key takes priority. If not provided, fall back to
    // sha256(email) with a shorter TTL so future legitimate submissions work.
    const clientKey = req.headers.get("idempotency-key");
    let idempotencyKey: string;
    let keyType: "client_supplied" | "email_derived";
    let idempotencyTtl: number;

    if (clientKey && clientKey.length >= 8 && clientKey.length <= 128) {
      idempotencyKey = await sha256hex(`client:${clientKey}`);
      keyType        = "client_supplied";
      idempotencyTtl = CLIENT_KEY_TTL_MS;
      log("info", "IDEMPOTENCY_KEY_SOURCE", "Using client-supplied idempotency key", { requestId });
    } else {
      idempotencyKey = await sha256hex(`email:${email}`);
      keyType        = "email_derived";
      idempotencyTtl = EMAIL_KEY_TTL_MS;
      log("info", "IDEMPOTENCY_KEY_SOURCE", "Using email-derived idempotency key", { requestId });
    }

    const cached = await getIdempotentResponse(db, idempotencyKey, idempotencyTtl);
    if (cached) {
      log("info", "IDEMPOTENT_HIT", "Returning cached response", {
        requestId, keyType, status: cached.status,
      });
      return jsonResponse(
        { ...cached.body, idempotent: true },
        cached.status,
        { "X-Request-Id": requestId },
      );
    }

    // ── Resend API key guard ──────────────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      log("error", "CONFIG_ERROR", "RESEND_API_KEY not configured", { requestId });
      return jsonResponse(
        { error: "Email service not configured", code: "CONFIG_ERROR" },
        500, { "X-Request-Id": requestId },
      );
    }

    const safeEmail   = escapeHtml(email);
    const ownerEmail  = "info@makhana-express.com";
    const couponCode  = "LAUNCH2026";

    const subscriberHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Welcome to Makhana Express</title></head>
<body style="margin:0;padding:0;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#154212;padding:36px 40px 28px;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Makhana Express</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">From Pond To Pack, Done Right.</p>
    </div>
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 12px;color:#154212;font-size:22px;font-weight:800;">Welcome to the community!</h2>
      <p style="margin:0 0 20px;color:#42493e;font-size:15px;line-height:1.6;">
        Thank you for joining us. As promised, here's your exclusive <strong>20% off</strong> coupon for your first order:
      </p>
      <div style="background:#f8f4de;border:2px dashed #a1d494;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 6px;color:#42493e;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Coupon Code</p>
        <p style="margin:0;color:#154212;font-size:30px;font-weight:900;letter-spacing:4px;">${couponCode}</p>
        <p style="margin:8px 0 0;color:#72796e;font-size:12px;">20% off your first order · Valid for new customers only</p>
      </div>
      <p style="margin:0 0 20px;color:#42493e;font-size:14px;line-height:1.6;">
        Our makhana is harvested by hand from Bihar's freshwater lotus ponds — no preservatives, no shortcuts. Just pure, clean snacking.
      </p>
      <p style="margin:0;color:#72796e;font-size:13px;">
        Follow us on <a href="https://www.instagram.com/makhanaexpress" style="color:#154212;font-weight:700;">Instagram</a> for updates on new flavours and restocks.
      </p>
    </div>
    <div style="background:#f8f4de;padding:20px 40px;border-top:1px solid #ece9d3;">
      <p style="margin:0;color:#72796e;font-size:12px;">© 2026 Makhana Express. From the heart of Bihar.</p>
    </div>
  </div>
</body>
</html>`;

    const ownerHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Subscriber</title></head>
<body style="margin:0;padding:32px;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 16px;color:#1a3d0a;">New Newsletter Subscriber</h2>
    <p style="margin:0 0 8px;color:#3d2b0a;font-size:16px;">Someone just subscribed:</p>
    <p style="margin:0;color:#1a3d0a;font-size:20px;font-weight:700;">${safeEmail}</p>
    <p style="margin:16px 0 0;color:#72796e;font-size:12px;">Request ID: ${requestId}</p>
  </div>
</body>
</html>`;

    log("info", "EMAIL_SENDING", "Dispatching emails", { requestId, email });

    const [subscriberResult, ownerResult] = await Promise.allSettled([
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [email],
        subject: "Your 20% off coupon is here — welcome to Makhana Express!",
        html: subscriberHtml,
      }, requestId),
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New subscriber: ${safeEmail}`,
        html: ownerHtml,
      }, requestId),
    ]);

    if (ownerResult.status === "rejected") {
      log("error", "OWNER_NOTIFY_FAILED", "Owner notification threw after retries", {
        requestId, error: String(ownerResult.reason),
      });
    } else if (!ownerResult.value.ok) {
      log("error", "OWNER_NOTIFY_REJECTED", "Owner notification rejected by Resend", {
        requestId, statusCode: ownerResult.value.statusCode, body: ownerResult.value.body,
      });
    }

    if (subscriberResult.status === "rejected") {
      log("error", "EMAIL_FAILED", "Subscriber email threw after retries", {
        requestId, error: String(subscriberResult.reason),
      });
      return jsonResponse(
        { error: "Failed to send welcome email", code: "EMAIL_FAILED" },
        500, { "X-Request-Id": requestId },
      );
    }

    const sub = subscriberResult.value;

    if (!sub.ok) {
      log("error", "EMAIL_FAILED", "Resend rejected subscriber email", {
        requestId, statusCode: sub.statusCode, body: sub.body,
      });

      let userError = "Failed to send welcome email";
      let userCode  = "EMAIL_FAILED";
      let httpStatus = 500;

      if (sub.statusCode === 422 || sub.statusCode === 400) {
        userError  = "Email address rejected by mail provider";
        userCode   = "EMAIL_REJECTED";
        httpStatus = 422;
      } else if (sub.statusCode === 429) {
        userError  = "Email service rate limit reached. Try again shortly.";
        userCode   = "UPSTREAM_RATE_LIMITED";
        httpStatus = 429;
      }

      return jsonResponse(
        { error: userError, code: userCode },
        httpStatus, { "X-Request-Id": requestId },
      );
    }

    log("info", "EMAIL_QUEUED", "Welcome email accepted by Resend", {
      requestId,
      messageId: sub.id,
      deliveryStatus: "accepted",
      note: "accepted ≠ delivered — webhook events update email_delivery_log",
    });

    const successBody: Record<string, unknown> = {
      success: true,
      messageId: sub.id,
      deliveryStatus: "accepted",
      deliveryNote:
        "Email accepted by Resend. Final delivery status (delivered/bounced) is " +
        "tracked asynchronously via the resend-webhook endpoint.",
    };

    await saveIdempotentResponse(
      db, idempotencyKey, keyType, 200, successBody, sub.id,
    );

    return jsonResponse(successBody, 200, { "X-Request-Id": requestId });

  } catch (err) {
    log("error", "UNHANDLED_ERROR", "Unexpected handler error", {
      requestId, error: String(err),
    });
    return jsonResponse(
      { error: "Unexpected error", code: "UNHANDLED_ERROR" },
      500, { "X-Request-Id": requestId },
    );
  }
});
