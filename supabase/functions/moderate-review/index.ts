import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// =============================================================================
// MODERATE REVIEW (admin)
// -----------------------------------------------------------------------------
// Operator-only moderation for customer_reviews. Protected by a shared secret:
// the caller must send `Authorization: Bearer <ADMIN_API_KEY>` where ADMIN_API_KEY
// is a Supabase edge-function secret the operator sets. Without that secret
// configured the endpoint refuses to act (CONFIGURATION_REQUIRED) rather than
// running open.
//
//   GET  ?status=pending            -> list reviews with that status (default pending)
//   POST { id, action }             -> action ∈ approve | reject | feature | unfeature | delete
//
// Uses the service role, so it can read pending/rejected rows the public policy
// hides and can flip moderation state the browser can never touch.
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Length-independent comparison so the admin token cannot be recovered by timing.
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminKey = Deno.env.get("ADMIN_API_KEY");
    if (!adminKey) {
      return json(
        { error: "Moderation is not configured. Set the ADMIN_API_KEY secret.", code: "CONFIGURATION_REQUIRED" },
        503,
      );
    }

    const auth = req.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
    if (!token || !safeEqual(token, adminKey)) {
      return json({ error: "Not authorized", code: "UNAUTHORIZED" }, 401);
    }

    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    if (req.method === "GET") {
      const url = new URL(req.url);
      const status = url.searchParams.get("status") ?? "pending";
      if (!["pending", "approved", "rejected"].includes(status)) {
        return json({ error: "Invalid status filter", code: "INVALID_STATUS" }, 400);
      }
      const { data, error } = await db
        .from("customer_reviews")
        .select("id, customer_name, rating, title, body, is_verified, is_featured, status, created_at")
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return json({ reviews: data ?? [] }, 200);
    }

    if (req.method === "POST") {
      let payload: Record<string, unknown>;
      try {
        payload = await req.json();
      } catch {
        return json({ error: "Invalid request", code: "INVALID_JSON" }, 400);
      }
      const id = typeof payload.id === "string" ? payload.id : "";
      const action = typeof payload.action === "string" ? payload.action : "";
      if (!id) return json({ error: "Missing review id", code: "MISSING_ID" }, 400);

      if (action === "approve" || action === "reject") {
        const { error } = await db
          .from("customer_reviews")
          .update({ status: action === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return json({ success: true, id, status: action === "approve" ? "approved" : "rejected" }, 200);
      }
      if (action === "feature" || action === "unfeature") {
        const { error } = await db
          .from("customer_reviews")
          .update({ is_featured: action === "feature" })
          .eq("id", id);
        if (error) throw error;
        return json({ success: true, id, is_featured: action === "feature" }, 200);
      }
      if (action === "delete") {
        const { error } = await db.from("customer_reviews").delete().eq("id", id);
        if (error) throw error;
        return json({ success: true, id, deleted: true }, 200);
      }
      return json({ error: "Unknown action", code: "INVALID_ACTION" }, 400);
    }

    return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  } catch (err) {
    console.error(JSON.stringify({ level: "error", code: "UNHANDLED", message: String(err) }));
    return json({ error: "Unexpected error", code: "UNHANDLED_ERROR" }, 500);
  }
});
