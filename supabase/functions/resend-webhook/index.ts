import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// =============================================================================
// RESEND WEBHOOK HANDLER
// -----------------------------------------------------------------------------
// Receives delivery event notifications from Resend and writes them to
// email_delivery_log. On hard bounces and spam complaints, also marks the
// subscriber inactive in newsletter_subscribers.
//
// Setup in Resend dashboard:
//   Endpoint URL : https://<project-ref>.supabase.co/functions/v1/resend-webhook
//   Events       : email.sent, email.delivered, email.bounced, email.complained,
//                  email.opened, email.clicked, email.delivery_delayed
//   Signing key  : set RESEND_WEBHOOK_SECRET in Supabase edge function secrets
//
// Delivery status model:
//   accepted          — Resend received the send request (logged by send-welcome-email)
//   email.sent        — Resend handed off to the receiving mail server
//   email.delivered   — Receiving server confirmed delivery
//   email.bounced     — Delivery failed (hard = permanent, soft = transient)
//   email.complained  — Recipient marked as spam
//   email.opened      — Recipient opened the email (pixel-tracked)
//   email.clicked     — Recipient clicked a link
//   email.delivery_delayed — Temporary delay; Resend will retry
// =============================================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, Svix-Id, Svix-Timestamp, Svix-Signature",
};

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
    service: "resend-webhook",
    ...meta,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// =============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// -----------------------------------------------------------------------------
// Resend signs webhooks using Svix. The signature covers:
//   svix_id + "." + svix_timestamp + "." + raw_body
// We verify against HMAC-SHA256 using the RESEND_WEBHOOK_SECRET.
//
// If the secret is not configured we log a warning and allow the request
// through in development. In production this should always be set.
// =============================================================================
async function verifySignature(
  req: Request,
  rawBody: string,
): Promise<boolean> {
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) {
    log("warn", "WEBHOOK_NO_SECRET", "RESEND_WEBHOOK_SECRET not set — skipping signature check");
    return true;
  }

  const svixId        = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    log("warn", "WEBHOOK_MISSING_HEADERS", "Missing Svix signature headers");
    return false;
  }

  // Reject webhooks older than 5 minutes (replay attack prevention)
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    log("warn", "WEBHOOK_TIMESTAMP_INVALID", "Webhook timestamp out of window", {
      svixTimestamp, nowSecs: Math.floor(Date.now() / 1000),
    });
    return false;
  }

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

  // Secret may be prefixed with "whsec_" — strip it for raw key bytes
  const rawSecret = secret.startsWith("whsec_")
    ? secret.slice(6)
    : secret;

  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
  } catch {
    log("error", "WEBHOOK_SECRET_DECODE_FAILED", "Could not base64-decode webhook secret");
    return false;
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedContent),
  );

  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // svix-signature may contain multiple space-separated "v1,<base64>" entries
  const valid = svixSignature.split(" ").some((part) => {
    const [version, value] = part.split(",");
    return version === "v1" && value === computed;
  });

  if (!valid) {
    log("warn", "WEBHOOK_SIGNATURE_MISMATCH", "Webhook signature verification failed");
  }

  return valid;
}

// =============================================================================
// EVENTS THAT INDICATE A HARD FAILURE — subscriber should be deactivated
// =============================================================================
const DEACTIVATE_EVENTS = new Set([
  "email.bounced",
  "email.complained",
]);

// Bounce types that are permanent (as opposed to transient soft bounces)
const HARD_BOUNCE_TYPES = new Set([
  "hard",
  "permanent",
]);

function shouldDeactivate(eventType: string, payload: Record<string, unknown>): boolean {
  if (eventType === "email.complained") return true;
  if (eventType === "email.bounced") {
    const bounceType = (
      (payload?.data as Record<string, unknown>)?.bounce_type as string ?? ""
    ).toLowerCase();
    return HARD_BOUNCE_TYPES.has(bounceType);
  }
  return false;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const requestId = req.headers.get("svix-id") ?? crypto.randomUUID();

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new Response(JSON.stringify({ error: "Could not read body" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // ── Signature verification ────────────────────────────────────────────────
  const signatureValid = await verifySignature(req, rawBody);
  if (!signatureValid) {
    return new Response(JSON.stringify({ error: "Invalid signature", code: "INVALID_SIGNATURE" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // ── Parse payload ─────────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    log("error", "WEBHOOK_PARSE_FAILED", "Could not parse webhook body", { requestId });
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const eventType = payload?.type as string ?? "";
  const data      = (payload?.data ?? {}) as Record<string, unknown>;
  const messageId = (data?.email_id ?? data?.id ?? "") as string;
  const email     = ((data?.to as string[])?.[0] ?? data?.to ?? "") as string;

  log("info", "WEBHOOK_RECEIVED", "Resend webhook received", {
    requestId, eventType, messageId, email,
  });

  if (!eventType) {
    log("warn", "WEBHOOK_NO_TYPE", "Webhook payload missing event type", { requestId });
    return new Response(JSON.stringify({ error: "Missing event type" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // ── Log event to email_delivery_log ──────────────────────────────────────
  const { error: insertError } = await db.from("email_delivery_log").insert({
    message_id: messageId || requestId,
    email:      typeof email === "string" ? email.trim().toLowerCase() : "",
    event:      eventType,
    event_data: payload,
  });

  if (insertError) {
    log("error", "WEBHOOK_LOG_INSERT_FAILED", "Failed to insert delivery log", {
      requestId, eventType, error: insertError.message,
    });
    return new Response(
      JSON.stringify({ error: "Failed to log event", code: "DB_INSERT_FAILED" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  log("info", "WEBHOOK_LOGGED", "Delivery event recorded", {
    requestId, eventType, messageId, email,
  });

  // ── Deactivate subscriber on hard bounce or spam complaint ────────────────
  if (email && shouldDeactivate(eventType, payload)) {
    const normalizedEmail = typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

    if (normalizedEmail) {
      const { error: updateError } = await db
        .from("newsletter_subscribers")
        .update({ is_active: false })
        .eq("email", normalizedEmail);

      if (updateError) {
        log("error", "WEBHOOK_DEACTIVATE_FAILED", "Failed to deactivate subscriber", {
          requestId, eventType, error: updateError.message,
        });
      } else {
        log("info", "SUBSCRIBER_DEACTIVATED", "Subscriber marked inactive due to delivery failure", {
          requestId, eventType, reason: eventType === "email.complained" ? "spam_complaint" : "hard_bounce",
        });
      }
    }
  }

  // ── Always return 200 to Resend so it does not retry ─────────────────────
  // Resend retries on non-2xx. Return 200 even for non-critical errors above
  // so the event is not re-delivered. The DB error is already logged.
  return new Response(JSON.stringify({ received: true, eventType }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
