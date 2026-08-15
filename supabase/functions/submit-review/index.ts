import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// =============================================================================
// SUBMIT REVIEW
// -----------------------------------------------------------------------------
// Accepts a first-party customer review and stores it as PENDING moderation.
// The browser has no direct write access to customer_reviews (RLS exposes only
// approved rows for SELECT and grants no write policy), so this function — using
// the service role — is the only path that can create a review. That is what
// keeps `status` and `is_verified` server-controlled and unforgeable.
//
// Verified Purchase: if the caller supplies an order_number + access_token that
// match a real order containing the reviewed product, the review is linked to
// that order and flagged verified. The order_id UNIQUE index caps this at one
// review per order.
//
// Anti-abuse: IP rate limit (reuses the shared upsert_rate_limit_counter RPC),
// strict length/shape validation, and plain-text-only storage (no HTML).
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RL_WINDOW_SECS = 600;
const RL_MAX = 3;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Collapse whitespace and drop control characters. Storage is plain text and
// React escapes on render, so there is no HTML/script execution path; this just
// keeps the data clean and bounded.
function clean(input: unknown, max: number): string {
  if (typeof input !== "string") return "";
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, max);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  }

  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let payload: Record<string, unknown>;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid request", code: "INVALID_JSON" }, 400);
    }

    const customerName = clean(payload.customer_name, 80);
    const title = clean(payload.title, 120);
    const body = clean(payload.body, 2000);
    const ratingRaw = Number(payload.rating);
    const rating = Number.isInteger(ratingRaw) ? ratingRaw : Math.round(ratingRaw);
    const productSlug = clean(payload.product_slug, 120);
    const orderNumber = clean(payload.order_number, 40);
    const accessToken = clean(payload.access_token, 128);

    if (customerName.length < 2) {
      return json({ error: "Please enter your name.", code: "INVALID_NAME" }, 400);
    }
    if (!(rating >= 1 && rating <= 5)) {
      return json({ error: "Please choose a rating from 1 to 5 stars.", code: "INVALID_RATING" }, 400);
    }
    if (body.length < 10) {
      return json({ error: "Please write at least a few words about your experience.", code: "INVALID_BODY" }, 400);
    }

    // ── IP rate limit (shared Postgres counter; fail open on limiter error) ──
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const windowStart = new Date(
      Math.floor(Date.now() / (RL_WINDOW_SECS * 1000)) * (RL_WINDOW_SECS * 1000),
    ).toISOString();
    const { data: rlCount, error: rlError } = await db.rpc("upsert_rate_limit_counter", {
      p_key: `review:ip:${ip}`,
      p_window_start: windowStart,
      p_max: RL_MAX,
    });
    if (!rlError && (rlCount as number) > RL_MAX) {
      return json(
        { error: "You've submitted a few reviews already. Please try again later.", code: "RATE_LIMITED" },
        429,
      );
    }

    // ── Resolve product (optional) ───────────────────────────────────────────
    let productId: string | null = null;
    if (productSlug) {
      const { data: product } = await db
        .from("products")
        .select("id")
        .eq("slug", productSlug)
        .maybeSingle();
      productId = product?.id ?? null;
    }

    // ── Verified purchase (optional) ──────────────────────────────────────────
    let orderId: string | null = null;
    let isVerified = false;
    if (orderNumber && accessToken) {
      const { data: order } = await db
        .from("orders")
        .select("id, access_token")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (order && order.access_token && order.access_token === accessToken) {
        // Confirm the order actually contains the reviewed product when one was given.
        if (productId) {
          const { data: item } = await db
            .from("order_items")
            .select("id")
            .eq("order_id", order.id)
            .eq("product_id", productId)
            .maybeSingle();
          isVerified = Boolean(item);
        } else {
          isVerified = true;
        }
        if (isVerified) orderId = order.id as string;
      }
    }

    const insertRow = {
      product_id: productId,
      order_id: orderId,
      customer_name: customerName,
      rating,
      title,
      body,
      is_verified: isVerified,
      status: "pending",
    };

    const { error: insertError } = await db.from("customer_reviews").insert(insertRow);

    if (insertError) {
      // Unique violation on order_id => this order was already reviewed.
      if ((insertError as { code?: string }).code === "23505") {
        return json(
          { error: "You've already left a review for this order. Thank you!", code: "ALREADY_REVIEWED" },
          409,
        );
      }
      console.error(JSON.stringify({ level: "error", code: "REVIEW_INSERT_FAILED", message: insertError.message }));
      return json({ error: "We couldn't save your review. Please try again.", code: "SAVE_FAILED" }, 500);
    }

    return json(
      {
        success: true,
        verified: isVerified,
        message: "Thank you! Your review has been submitted and will appear once approved.",
      },
      200,
    );
  } catch (err) {
    console.error(JSON.stringify({ level: "error", code: "UNHANDLED", message: String(err) }));
    return json({ error: "Unexpected error", code: "UNHANDLED_ERROR" }, 500);
  }
});
