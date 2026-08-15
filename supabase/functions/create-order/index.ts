import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Idempotency-Key",
};

const FREE_SHIPPING_THRESHOLD_CENTS = 49900;
const FLAT_SHIPPING_CENTS = 4900;

interface IncomingItem { product_id: string; quantity: number; }
interface OrderPayload {
  idempotency_key?: string;
  customer: { name: string; email: string; phone: string };
  address: { addressLine: string; street: string; city: string; state: string; pincode: string };
  payment_method: string;
  items: IncomingItem[];
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  INSUFFICIENT_STOCK: { message: "Sorry, we don't have enough stock for that quantity.", status: 409 },
  PRODUCT_INACTIVE: { message: "A product in your cart is no longer available.", status: 409 },
  PRODUCT_NOT_FOUND: { message: "A product in your cart could not be found.", status: 409 },
  PAYMENT_METHOD_UNAVAILABLE: { message: "That payment method isn't available yet. Please choose Cash on Delivery.", status: 400 },
  EMPTY_ORDER: { message: "Your cart is empty.", status: 400 },
  INVALID_QUANTITY: { message: "Invalid item quantity.", status: 400 },
};

function money(cents: number): string {
  return "\u20B9" + (cents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

interface OrderResult {
  order_number: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_method: string;
  items: { product_name: string; quantity: number; line_total_cents: number }[];
}

async function sendConfirmationEmail(order: OrderResult, payload: OrderPayload): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@makhana-express.com";
  const a = payload.address;
  const itemsHtml = order.items.map((i) =>
    `<tr><td style="padding:6px 0;color:#42493e;">${escapeHtml(i.product_name)} &times; ${i.quantity}</td>` +
    `<td style="padding:6px 0;text-align:right;color:#154212;font-weight:700;">${money(i.line_total_cents)}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:#f5f0eb;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#154212;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">Makhana Express</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Order confirmed</p>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="margin:0 0 8px;color:#154212;">Thank you, ${escapeHtml(payload.customer.name)}!</h2>
      <p style="margin:0 0 20px;color:#42493e;font-size:15px;">Your order <strong>${order.order_number}</strong> has been placed.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemsHtml}
        <tr><td style="padding:8px 0;border-top:1px solid #ece9d3;color:#72796e;">Subtotal</td><td style="padding:8px 0;border-top:1px solid #ece9d3;text-align:right;">${money(order.subtotal_cents)}</td></tr>
        <tr><td style="padding:4px 0;color:#72796e;">Shipping</td><td style="padding:4px 0;text-align:right;">${order.shipping_cents === 0 ? "Free" : money(order.shipping_cents)}</td></tr>
        <tr><td style="padding:8px 0;color:#154212;font-weight:800;">${order.payment_status === "paid" ? "Total paid" : "Total due on delivery"}</td><td style="padding:8px 0;text-align:right;color:#154212;font-weight:800;">${money(order.total_cents)}</td></tr>
      </table>
      <p style="margin:20px 0 4px;color:#154212;font-weight:700;font-size:14px;">Delivery address</p>
      <p style="margin:0;color:#42493e;font-size:14px;line-height:1.6;">
        ${escapeHtml(a.addressLine)}${a.street ? ", " + escapeHtml(a.street) : ""}<br/>
        ${escapeHtml(a.city)}, ${escapeHtml(a.state)} &mdash; ${escapeHtml(a.pincode)}<br/>
        ${escapeHtml(payload.customer.phone)}
      </p>
      <p style="margin:24px 0 0;color:#72796e;font-size:13px;">Payment method: Cash on Delivery. Questions? Reply to this email or write to info@makhana-express.com.</p>
    </div>
  </div></body></html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Makhana Express <${from}>`,
        to: [payload.customer.email.trim().toLowerCase()],
        subject: `Order confirmed — ${order.order_number}`,
        html,
      }),
    });
  } catch {
    // Email failures must never fail an otherwise-valid order.
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = (await req.json()) as OrderPayload;
    const { customer, address, items } = payload ?? {};

    if (!customer || !address || !Array.isArray(items) || items.length === 0) {
      return json({ error: "Invalid order request." }, 400);
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email ?? "");
    const phoneOk = /^[0-9]{10}$/.test((customer.phone ?? "").replace(/\D/g, "").slice(-10));
    const pincodeOk = /^[1-9][0-9]{5}$/.test(address.pincode ?? "");
    if (
      !isNonEmpty(customer.name) || !emailOk || !phoneOk ||
      !isNonEmpty(address.addressLine) || !isNonEmpty(address.city) ||
      !isNonEmpty(address.state) || !pincodeOk
    ) {
      return json({ error: "Please check your details and try again." }, 400);
    }

    const cleanItems: IncomingItem[] = [];
    for (const it of items) {
      const qty = Math.floor(Number(it?.quantity));
      if (!isNonEmpty(it?.product_id) || !Number.isFinite(qty) || qty < 1 || qty > 50) {
        return json({ error: "Invalid item in cart." }, 400);
      }
      cleanItems.push({ product_id: it.product_id, quantity: qty });
    }

    const idempotencyKey = payload.idempotency_key || req.headers.get("idempotency-key") || "";
    const paymentMethod = payload.payment_method || "cod";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase.rpc("create_order", {
      p_idempotency_key: idempotencyKey,
      p_customer_name: customer.name.trim(),
      p_customer_email: customer.email.trim(),
      p_customer_phone: customer.phone.trim(),
      p_address_line: address.addressLine.trim(),
      p_street: (address.street ?? "").trim(),
      p_city: address.city.trim(),
      p_state: address.state.trim(),
      p_pincode: address.pincode.trim(),
      p_payment_method: paymentMethod,
      p_items: cleanItems,
      p_free_shipping_threshold: FREE_SHIPPING_THRESHOLD_CENTS,
      p_flat_shipping: FLAT_SHIPPING_CENTS,
    });

    if (error) {
      const code = (error.message || "").match(/[A-Z_]{4,}/)?.[0] ?? "";
      const mapped = ERROR_MESSAGES[code];
      if (mapped) return json({ error: mapped.message, code }, mapped.status);
      console.error(JSON.stringify({ level: "error", code: "ORDER_RPC_FAILED", message: error.message }));
      return json({ error: "We could not place your order. Please try again." }, 500);
    }

    const order = data as OrderResult & { access_token: string; idempotent: boolean };
    if (!order || typeof order.order_number !== "string") {
      return json({ error: "We could not place your order. Please try again." }, 500);
    }

    if (!order.idempotent) {
      await sendConfirmationEmail(order, payload);
    }

    return json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    console.error(JSON.stringify({ level: "error", code: "UNHANDLED", message }));
    return json({ error: "We could not place your order. Please try again." }, 500);
  }
});
