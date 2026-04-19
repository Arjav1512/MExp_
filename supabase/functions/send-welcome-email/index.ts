import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// =============================================================================
// DELIVERY GUARANTEE NOTICE
// -----------------------------------------------------------------------------
// A 200 response from this function means Resend accepted the message for
// delivery. It does NOT guarantee the email reached the recipient's inbox.
// Factors outside our control (spam filters, invalid MX, recipient server
// bounces) can still prevent delivery after acceptance.
//
// For authoritative delivery status, configure a Resend webhook that POSTs
// events (delivered, bounced, complained) to a separate edge function which
// can update the newsletter_subscribers table accordingly.
// =============================================================================

// =============================================================================
// CORS
// =============================================================================
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Request-Id",
};

// =============================================================================
// EMAIL VALIDATION
// -----------------------------------------------------------------------------
// The backend is the authoritative source of truth for validation.
// The frontend carries an identical copy in src/lib/emailValidation.ts purely
// as a UX convenience (instant feedback without a round-trip). Any change here
// must be mirrored there. The backend will always reject invalid addresses even
// if the frontend check is bypassed.
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
// Every log line is a JSON object. Fields:
//   level     — "info" | "warn" | "error"
//   code      — machine-readable error/event code (e.g. RATE_LIMITED)
//   message   — human-readable description
//   requestId — correlation ID for tracing the full request lifecycle
//   timestamp — ISO-8601
//   service   — always "send-welcome-email"
//   ...meta   — arbitrary extra context
// =============================================================================
type LogLevel = "info" | "warn" | "error";

function log(
  level: LogLevel,
  code: string,
  message: string,
  meta: Record<string, unknown> = {}
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
// IN-MEMORY SLIDING-WINDOW RATE LIMITER
// -----------------------------------------------------------------------------
// Deno edge function isolates are long-lived; this Map persists across requests
// within the same isolate, making it genuinely concurrent-safe for intra-isolate
// traffic. Cross-isolate protection is handled by the idempotency_log DB table.
//
// Limits:
//   IP     — 5 requests / 60 s
//   email  — 1 request / 60 s  (duplicate guard)
// =============================================================================
const WINDOW_MS   = 60_000;
const IP_MAX      = 5;
const EMAIL_MAX   = 1;

const ipWindows:    Map<string, number[]> = new Map();
const emailWindows: Map<string, number[]> = new Map();

function slidingWindowCheck(
  store: Map<string, number[]>,
  key: string,
  max: number
): { allowed: boolean; count: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (store.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= max) return { allowed: false, count: hits.length };
  hits.push(now);
  store.set(key, hits);
  return { allowed: true, count: hits.length };
}

// =============================================================================
// SHA-256 DIGEST (idempotency key derivation)
// =============================================================================
async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// =============================================================================
// IDEMPOTENCY — DB-BACKED (survives isolate restarts / multiple instances)
// -----------------------------------------------------------------------------
// Key: sha256(normalizedEmail) — scoped to 10-minute TTL
// On hit: return cached status + body without re-processing.
// On miss: process normally, then persist the result.
// =============================================================================
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

type SupabaseAdmin = ReturnType<typeof createClient>;

async function getIdempotentResponse(
  db: SupabaseAdmin,
  key: string
): Promise<{ status: number; body: Record<string, unknown> } | null> {
  const cutoff = new Date(Date.now() - IDEMPOTENCY_TTL_MS).toISOString();
  const { data } = await db
    .from("idempotency_log")
    .select("status, body")
    .eq("key", key)
    .gte("created_at", cutoff)
    .maybeSingle();
  if (!data) return null;
  return { status: data.status as number, body: data.body as Record<string, unknown> };
}

async function saveIdempotentResponse(
  db: SupabaseAdmin,
  key: string,
  status: number,
  body: Record<string, unknown>
): Promise<void> {
  const { error } = await db
    .from("idempotency_log")
    .upsert({ key, status, body }, { onConflict: "key" });
  if (error) {
    // Non-fatal — log and continue. The next request will re-process but that's
    // acceptable; idempotency is best-effort across isolate boundaries.
    console.warn(JSON.stringify({
      level: "warn",
      code: "IDEMPOTENCY_SAVE_FAILED",
      message: "Failed to persist idempotency record",
      error: error.message,
    }));
  }
}

// =============================================================================
// RESEND EMAIL SENDER
// -----------------------------------------------------------------------------
// Retry policy:
//   - Retries only on: network errors, 429, 5xx
//   - Hard bail on: 400, 401, 403, 422  (retrying won't help)
//   - Backoff: exponential + full jitter — delay ∈ [0, base * 2^attempt]
//   - Max total timeout: 8 s across all attempts
//   - Respects Retry-After header from 429 responses
// =============================================================================
const MAX_RETRIES   = 2;
const BASE_DELAY_MS = 400;
const MAX_DELAY_MS  = 4000;
const TOTAL_TIMEOUT_MS = 8000;

interface ResendBody { id?: string; message?: string; name?: string; statusCode?: number; }
interface EmailResult { ok: boolean; id?: string; statusCode: number; body: ResendBody; }

function jitteredDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) return Math.min(retryAfterMs, MAX_DELAY_MS);
  const cap = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  return Math.random() * cap;
}

const NON_RETRYABLE = new Set([400, 401, 403, 422]);

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; html: string },
  requestId: string
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
          "Idempotency-Key": `${requestId}-${payload.to[0]}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      const isLast = attempt === MAX_RETRIES;
      log(isLast ? "error" : "warn", "NETWORK_ERROR", "Resend network error", {
        requestId, attempt, retryable: !isLast, error: String(netErr), to: payload.to,
      });
      if (isLast) return { ok: false, statusCode: 0, body: { message: String(netErr) } };
      await new Promise((r) => setTimeout(r, jitteredDelay(attempt)));
      continue;
    }

    let body: ResendBody = {};
    try { body = await res.json(); } catch { /* leave empty */ }

    if (res.ok) {
      if (!body.id) {
        log("warn", "EMAIL_NO_ID", "Resend returned 2xx but no message id", { requestId, attempt, body });
      }
      log("info", "EMAIL_ACCEPTED", "Resend accepted message", {
        requestId, attempt, messageId: body.id, to: payload.to,
      });
      return { ok: true, id: body.id, statusCode: res.status, body };
    }

    const isLast = attempt === MAX_RETRIES;

    if (NON_RETRYABLE.has(res.status)) {
      log("error", "EMAIL_REJECTED", "Resend rejected message (non-retryable)", {
        requestId, statusCode: res.status, body, to: payload.to,
      });
      return { ok: false, statusCode: res.status, body };
    }

    let retryAfterMs: number | undefined;
    const retryHeader = res.headers.get("retry-after");
    if (retryHeader) {
      const seconds = parseFloat(retryHeader);
      if (!isNaN(seconds)) retryAfterMs = seconds * 1000;
    }

    log(isLast ? "error" : "warn", "EMAIL_RETRYABLE_ERROR", "Resend returned retryable error", {
      requestId, attempt, maxRetries: MAX_RETRIES, statusCode: res.status,
      body, to: payload.to, retryAfterMs, willRetry: !isLast,
    });

    if (!isLast) {
      await new Promise((r) => setTimeout(r, jitteredDelay(attempt, retryAfterMs)));
    }
  }

  return { ok: false, statusCode: 0, body: { message: "Max retries exceeded" } };
}

// =============================================================================
// HELPERS
// =============================================================================
function escapeHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")
          .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;");
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extra: Record<string, string> = {}
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

  // Correlation ID — accept from client or generate one
  const requestId =
    req.headers.get("x-request-id") ||
    crypto.randomUUID();

  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // ── Parse body ───────────────────────────────────────────────────────────
    let rawEmail: unknown;
    try {
      const body = await req.json();
      rawEmail = body?.email;
    } catch {
      return jsonResponse(
        { error: "Invalid JSON body", code: "INVALID_JSON" },
        400, { "X-Request-Id": requestId }
      );
    }

    // ── Validation (backend is source of truth) ───────────────────────────────
    const validation = validateEmail(rawEmail as string);
    if (!validation.valid) {
      log("warn", "VALIDATION_ERROR", "Email validation failed", {
        requestId, reason: validation.reason,
        // Never log the raw email value for privacy on validation failures
      });
      return jsonResponse(
        { error: "Invalid email address", code: "VALIDATION_ERROR" },
        400, { "X-Request-Id": requestId }
      );
    }

    const email = (rawEmail as string).trim().toLowerCase();

    // ── IP extraction ─────────────────────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ── In-memory IP rate limit ───────────────────────────────────────────────
    const ipCheck = slidingWindowCheck(ipWindows, ip, IP_MAX);
    if (!ipCheck.allowed) {
      log("warn", "RATE_LIMITED", "IP rate limit exceeded", { requestId, ip, count: ipCheck.count });
      return jsonResponse(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
        429, { "X-Request-Id": requestId, "Retry-After": "60" }
      );
    }

    // ── In-memory per-email duplicate guard ───────────────────────────────────
    const emailCheck = slidingWindowCheck(emailWindows, email, EMAIL_MAX);
    if (!emailCheck.allowed) {
      log("warn", "DUPLICATE_SUBMISSION", "Email resubmitted within window", { requestId });
      return jsonResponse(
        { error: "This email was recently submitted. Please wait before trying again.", code: "DUPLICATE_SUBMISSION" },
        429, { "X-Request-Id": requestId, "Retry-After": "60" }
      );
    }

    // ── DB idempotency check (cross-isolate protection) ──────────────────────
    const idempotencyKey = await sha256hex(email);

    const cached = await getIdempotentResponse(db, idempotencyKey);
    if (cached) {
      log("info", "IDEMPOTENT_HIT", "Returning cached response", { requestId });
      return jsonResponse(
        { ...cached.body, idempotent: true },
        cached.status,
        { "X-Request-Id": requestId }
      );
    }

    // ── Resend API key guard ──────────────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      log("error", "CONFIG_ERROR", "RESEND_API_KEY not configured", { requestId });
      return jsonResponse(
        { error: "Email service not configured", code: "CONFIG_ERROR" },
        500, { "X-Request-Id": requestId }
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

    log("info", "EMAIL_SENDING", "Dispatching welcome email", { requestId, email });

    // ── Send both emails concurrently ────────────────────────────────────────
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

    // Owner notification: non-blocking; log failures but don't fail the request
    if (ownerResult.status === "rejected") {
      log("error", "OWNER_NOTIFY_FAILED", "Owner notification threw after retries", {
        requestId, error: String(ownerResult.reason),
      });
    } else if (!ownerResult.value.ok) {
      log("error", "OWNER_NOTIFY_REJECTED", "Owner notification rejected by Resend", {
        requestId, statusCode: ownerResult.value.statusCode, body: ownerResult.value.body,
      });
    }

    // Subscriber email: required for success
    if (subscriberResult.status === "rejected") {
      log("error", "EMAIL_FAILED", "Subscriber email threw after retries", {
        requestId, error: String(subscriberResult.reason),
      });
      const errBody = { error: "Failed to send welcome email", code: "EMAIL_FAILED" };
      return jsonResponse(errBody, 500, { "X-Request-Id": requestId });
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

      const errBody = { error: userError, code: userCode };
      // Don't cache error responses in idempotency log — allow retry
      return jsonResponse(errBody, httpStatus, { "X-Request-Id": requestId });
    }

    log("info", "EMAIL_QUEUED", "Welcome email accepted by Resend (delivery not guaranteed)", {
      requestId, messageId: sub.id, email,
      note: "Accepted ≠ delivered. Configure Resend webhooks for delivery confirmation.",
    });

    const successBody: Record<string, unknown> = {
      success: true,
      id: sub.id,
      // Explicit delivery guarantee disclosure in the API response
      delivery: "queued",
      deliveryNote: "Email accepted for delivery. Actual inbox delivery depends on recipient mail server and spam filters.",
    };

    // Persist idempotency record so concurrent/duplicate requests get the same result
    await saveIdempotentResponse(db, idempotencyKey, 200, successBody);

    return jsonResponse(successBody, 200, { "X-Request-Id": requestId });

  } catch (err) {
    log("error", "UNHANDLED_ERROR", "Unexpected handler error", {
      requestId, error: String(err),
    });
    return jsonResponse(
      { error: "Unexpected error", code: "UNHANDLED_ERROR" },
      500, { "X-Request-Id": requestId }
    );
  }
});
