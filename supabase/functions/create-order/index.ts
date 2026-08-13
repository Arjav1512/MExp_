import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FREE_SHIPPING_THRESHOLD_CENTS = 49900;
const FLAT_SHIPPING_CENTS = 4900;

interface IncomingItem {
  product_id: string;
  quantity: number;
}

interface OrderPayload {
  customer: { name: string; email: string; phone: string };
  address: { addressLine: string; street: string; city: string; state: string; pincode: string };
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ids = [...new Set(cleanItems.map((i) => i.product_id))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_cents, is_active, currency")
      .in("id", ids);

    if (prodErr) {
      return json({ error: "Could not verify products." }, 500);
    }

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems = cleanItems.map((it) => {
      const product = productMap.get(it.product_id);
      if (!product || !product.is_active) {
        throw new Error("A product in your cart is no longer available.");
      }
      const lineTotal = product.price_cents * it.quantity;
      subtotal += lineTotal;
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: product.price_cents,
        quantity: it.quantity,
        line_total_cents: lineTotal,
      };
    });

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
    const total = subtotal + shipping;
    const orderNumber = "ME-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone.trim(),
        address_line: address.addressLine.trim(),
        street: (address.street ?? "").trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: total,
        currency: "INR",
        status: "pending",
        payment_status: "unpaid",
      })
      .select("id, order_number, total_cents")
      .single();

    if (orderErr || !order) {
      return json({ error: "Could not place your order. Please try again." }, 500);
    }

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

    if (itemsErr) {
      await supabase.from("orders").delete().eq("id", order.id);
      return json({ error: "Could not place your order. Please try again." }, 500);
    }

    return json({
      order_number: order.order_number,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      currency: "INR",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return json({ error: message }, 400);
  }
});
