import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ---------------------------------------------------------------------------
// Shared validation — identical logic must be kept in sync with
// src/lib/emailValidation.ts on the frontend.
// Rules:
//   - Local part: 1–64 chars, no leading/trailing/consecutive dots
//   - Domain: valid labels separated by dots, no leading/trailing dots
//   - TLD: at least 2 alpha chars
//   - Full address: max 320 chars
// ---------------------------------------------------------------------------
const EMAIL_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): { valid: boolean; reason?: string } {
  if (typeof email !== "string") return { valid: false, reason: "not_string" };
  if (email.length > 320) return { valid: false, reason: "too_long" };

  const atIndex = email.indexOf("@");
  if (atIndex < 1 || atIndex > 64) return { valid: false, reason: "local_part_invalid" };

  const local = email.slice(0, atIndex);
  if (/\.\./.test(local)) return { valid: false, reason: "consecutive_dots_local" };

  const domain = email.slice(atIndex + 1);
  if (/\.\./.test(domain)) return { valid: false, reason: "consecutive_dots_domain" };

  if (!EMAIL_REGEX.test(email)) return { valid: false, reason: "regex_fail" };

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Structured logger — emits JSON for easy integration with log aggregators
// ---------------------------------------------------------------------------
function log(
  level: "info" | "warn" | "error",
  message: string,
  meta: Record<string, unknown> = {}
) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: "send-welcome-email",
    ...meta,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// Retry with exponential backoff — retries only on network errors or 5xx
// ---------------------------------------------------------------------------
interface ResendResponse {
  id?: string;
  statusCode?: number;
  message?: string;
  name?: string;
}

interface EmailResult {
  ok: boolean;
  id?: string;
  statusCode: number;
  body: ResendResponse;
}

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; html: string },
  maxRetries = 2
): Promise<EmailResult> {
  const delays = [500, 1000, 2000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;

    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      const isLast = attempt === maxRetries;
      log(isLast ? "error" : "warn", "Resend network error", {
        attempt,
        maxRetries,
        error: String(networkErr),
        to: payload.to,
        retryable: !isLast,
      });
      if (isLast) throw networkErr;
      await new Promise((r) => setTimeout(r, delays[attempt]));
      continue;
    }

    let body: ResendResponse = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }

    if (res.ok) {
      if (!body.id) {
        log("warn", "Resend returned 2xx but missing id field", { attempt, body, to: payload.to });
      }
      return { ok: true, id: body.id, statusCode: res.status, body };
    }

    const isRetryable = res.status >= 500 || res.status === 429;
    const isLast = attempt === maxRetries;

    log(isLast ? "error" : "warn", "Resend API error", {
      attempt,
      maxRetries,
      statusCode: res.status,
      body,
      to: payload.to,
      retryable: isRetryable && !isLast,
    });

    if (isRetryable && !isLast) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
      continue;
    }

    return { ok: false, statusCode: res.status, body };
  }

  return { ok: false, statusCode: 0, body: { message: "Max retries exceeded" } };
}

// ---------------------------------------------------------------------------
// IP-based rate limiting via Supabase (max 5 requests per IP per 60 seconds)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 5;

async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof createClient>,
  ip: string
): Promise<{ allowed: boolean; count: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SEC * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("action", "newsletter_subscribe")
    .gte("created_at", windowStart);

  if (error) {
    log("warn", "Rate limit check failed, allowing request", { ip, error: error.message });
    return { allowed: true, count: 0 };
  }

  return { allowed: (count ?? 0) < RATE_LIMIT_MAX, count: count ?? 0 };
}

async function recordRateLimitAttempt(
  supabaseAdmin: ReturnType<typeof createClient>,
  ip: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("rate_limit_log")
    .insert({ ip, action: "newsletter_subscribe" });

  if (error) {
    log("warn", "Failed to record rate limit attempt", { ip, error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Duplicate guard — rejects if same email submitted within 60s
// ---------------------------------------------------------------------------
async function isRecentDuplicate(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SEC * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", `email:${email}`)
    .eq("action", "newsletter_subscribe")
    .gte("created_at", windowStart);

  if (error) return false;
  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ---------------------------------------------------------------------------
// JSON response helper
// ---------------------------------------------------------------------------
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // --- Setup Supabase admin client (service role, bypasses RLS) ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // --- Parse body ---
    let email: unknown;
    try {
      const body = await req.json();
      email = body?.email;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!email || typeof email !== "string") {
      return jsonResponse({ error: "Email is required" }, 400);
    }

    // --- Backend email validation (source of truth) ---
    const validation = isValidEmail(email);
    if (!validation.valid) {
      log("warn", "Email validation rejected", { email, reason: validation.reason });
      return jsonResponse({ error: "Invalid email address" }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // --- IP extraction ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // --- IP-based rate limiting ---
    const { allowed, count } = await checkRateLimit(supabaseAdmin, ip);
    if (!allowed) {
      log("warn", "Rate limit exceeded", { ip, count, email: normalizedEmail });
      return jsonResponse(
        { error: "Too many requests. Please try again later." },
        429
      );
    }

    // --- Duplicate submission guard (same email within 60s) ---
    const isDuplicate = await isRecentDuplicate(supabaseAdmin, normalizedEmail);
    if (isDuplicate) {
      log("warn", "Duplicate submission blocked", { email: normalizedEmail });
      return jsonResponse(
        { error: "This email was recently submitted. Please wait before trying again." },
        429
      );
    }

    // --- Record this attempt (IP + email keyed) ---
    await Promise.all([
      recordRateLimitAttempt(supabaseAdmin, ip),
      recordRateLimitAttempt(supabaseAdmin, `email:${normalizedEmail}`),
    ]);

    // --- Check API key ---
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      log("error", "RESEND_API_KEY not configured");
      return jsonResponse({ error: "Email service not configured" }, 500);
    }

    const safeEmail = escapeHtml(normalizedEmail);
    const ownerEmail = "info@makhana-express.com";
    const couponCode = "LAUNCH2026";

    const subscriberHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Welcome to Makhana Express</title></head>
<body style="margin:0;padding:0;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#154212;padding:36px 40px 28px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Makhana Express</h1>
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
        Our makhana is harvested by hand from Bihar's freshwater lotus ponds — no preservatives, no shortcuts.
        Just pure, clean snacking.
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
<head><meta charset="UTF-8" /><title>New Subscriber</title></head>
<body style="margin:0;padding:32px;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 16px;color:#1a3d0a;">New Newsletter Subscriber</h2>
    <p style="margin:0 0 8px;color:#3d2b0a;font-size:16px;">Someone just subscribed:</p>
    <p style="margin:0;color:#1a3d0a;font-size:20px;font-weight:700;">${safeEmail}</p>
  </div>
</body>
</html>`;

    log("info", "Sending welcome email", { email: normalizedEmail });

    // --- Send both emails concurrently ---
    const [subscriberResult, ownerResult] = await Promise.allSettled([
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [normalizedEmail],
        subject: "Your 20% off coupon is here — welcome to Makhana Express!",
        html: subscriberHtml,
      }),
      sendEmail(RESEND_API_KEY, {
        from: "Makhana Express <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New subscriber: ${safeEmail}`,
        html: ownerHtml,
      }),
    ]);

    // --- Owner notification failure is non-blocking ---
    if (ownerResult.status === "rejected") {
      log("error", "Owner notification send failed", {
        email: normalizedEmail,
        error: String(ownerResult.reason),
      });
    } else if (!ownerResult.value.ok) {
      log("error", "Owner notification rejected by Resend", {
        email: normalizedEmail,
        statusCode: ownerResult.value.statusCode,
        body: ownerResult.value.body,
      });
    }

    // --- Subscriber email is required for success ---
    if (subscriberResult.status === "rejected") {
      log("error", "Subscriber welcome email threw after retries", {
        email: normalizedEmail,
        error: String(subscriberResult.reason),
      });
      return jsonResponse({ error: "Failed to send welcome email" }, 500);
    }

    const subResult = subscriberResult.value;

    if (!subResult.ok) {
      log("error", "Resend rejected subscriber email", {
        email: normalizedEmail,
        statusCode: subResult.statusCode,
        body: subResult.body,
      });

      if (subResult.statusCode === 422 || subResult.statusCode === 400) {
        return jsonResponse({ error: "Email address rejected by mail provider" }, 422);
      }
      if (subResult.statusCode === 429) {
        return jsonResponse({ error: "Email service rate limit reached. Try again shortly." }, 429);
      }
      return jsonResponse({ error: "Failed to send welcome email" }, 500);
    }

    if (!subResult.id) {
      log("warn", "Resend succeeded but returned no message id", {
        email: normalizedEmail,
        body: subResult.body,
      });
    }

    log("info", "Welcome email sent successfully", {
      email: normalizedEmail,
      messageId: subResult.id,
    });

    return jsonResponse({ success: true, id: subResult.id }, 200);
  } catch (err) {
    log("error", "Unexpected handler error", { error: String(err) });
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});
