/*
# Atomic order creation, inventory safety, idempotency & secure lookup

Hardens the ordering pipeline so a real customer order is created safely and
consistently. All the multi-step work (validating stock, taking authoritative
prices, decrementing inventory, creating the order and its items) now happens
inside ONE database function that runs as a single transaction — so it either
all succeeds or nothing is written. No partial orders, no overselling, no
duplicate orders on retry.

## 1. Changes to existing tables

### `orders` — new columns
- `payment_method` (text, default '') — how the customer chose to pay (e.g. 'cod')
- `idempotency_key` (text, unique) — dedupes retries: the same key always maps
  to the same single order
- `access_token` (text) — an unguessable token returned to the customer so they
  can securely look up ONLY their own order after checkout

## 2. New database objects

### `order_number_seq` (sequence)
Guarantees every order number is unique even when many orders are placed at the
same instant. Order numbers look like `ME-000123`.

### `create_order(...)` — SECURITY DEFINER function
The single authoritative entry point for placing an order. It:
1. Returns the existing order if the idempotency key was already used (safe retry).
2. Locks and validates each product (must exist, be active, have enough stock).
3. Uses the product's real price from the database — never a client price.
4. Computes subtotal, shipping (free at/above the threshold, otherwise flat) and total.
5. Atomically decrements stock with a guard so it can never go negative / oversell.
6. Creates the order and all order items.
7. Returns the full order (including its items and access token) as JSON.
Only Cash on Delivery ('cod') is accepted right now; prepaid methods are rejected
until a real payment provider is connected, so no order is ever falsely marked paid.

### `get_order(p_order_number, p_access_token)` — SECURITY DEFINER function
Lets a customer retrieve one order and its items, but ONLY when they present the
correct order number AND its matching secret access token. This makes order
verification possible without exposing the orders table to public reads and
without allowing anyone to enumerate other people's orders.

## 3. Security

- `create_order` is executable ONLY by the service role (the server-side
  `create-order` edge function). It is revoked from anon/authenticated/public so
  the browser cannot call it directly.
- `get_order` is executable by anon/authenticated but is safe because it requires
  the secret token and returns a single order.
- The `orders` and `order_items` tables remain fully locked (RLS on, no policies),
  so the only way in or out is through these audited functions.

## 4. Notes

1. Money is in paise (integer). All totals are computed in-database.
2. Stock is decremented with `stock = stock - qty WHERE stock >= qty`, which is
   safe under concurrent buyers competing for the last unit.
3. The function raises clear coded errors (`INSUFFICIENT_STOCK`,
   `PRODUCT_INACTIVE`, `PRODUCT_NOT_FOUND`, `PAYMENT_METHOD_UNAVAILABLE`,
   `EMPTY_ORDER`) that the edge function maps to friendly messages.
*/

-- ── New columns on orders ────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='idempotency_key') THEN
    ALTER TABLE orders ADD COLUMN idempotency_key text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='access_token') THEN
    ALTER TABLE orders ADD COLUMN access_token text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ── Order number sequence ────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- ── Atomic order creation ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_order(
  p_idempotency_key text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address_line text,
  p_street text,
  p_city text,
  p_state text,
  p_pincode text,
  p_payment_method text,
  p_items jsonb,
  p_free_shipping_threshold integer,
  p_flat_shipping integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing orders%ROWTYPE;
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_product products%ROWTYPE;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_total integer := 0;
  v_order orders%ROWTYPE;
  v_order_number text;
  v_access_token text;
  v_items_result jsonb := '[]'::jsonb;
BEGIN
  -- 1. Idempotent replay
  IF p_idempotency_key IS NOT NULL AND length(p_idempotency_key) > 0 THEN
    SELECT * INTO v_existing FROM orders WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'unit_price_cents', oi.unit_price_cents,
        'quantity', oi.quantity,
        'line_total_cents', oi.line_total_cents
      )), '[]'::jsonb) INTO v_items_result FROM order_items oi WHERE oi.order_id = v_existing.id;
      RETURN jsonb_build_object(
        'order_number', v_existing.order_number,
        'subtotal_cents', v_existing.subtotal_cents,
        'shipping_cents', v_existing.shipping_cents,
        'total_cents', v_existing.total_cents,
        'currency', v_existing.currency,
        'status', v_existing.status,
        'payment_status', v_existing.payment_status,
        'payment_method', v_existing.payment_method,
        'access_token', v_existing.access_token,
        'items', v_items_result,
        'idempotent', true
      );
    END IF;
  END IF;

  -- 2. Payment method guard (only COD is genuinely available)
  IF p_payment_method <> 'cod' THEN
    RAISE EXCEPTION 'PAYMENT_METHOD_UNAVAILABLE';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER';
  END IF;

  -- 3. Validate + lock products, decrement stock, compute totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;

    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 50 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = v_product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;
    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'PRODUCT_INACTIVE';
    END IF;
    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

    UPDATE products SET stock = stock - v_qty WHERE id = v_product_id;

    v_subtotal := v_subtotal + (v_product.price_cents * v_qty);
    v_items_result := v_items_result || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'unit_price_cents', v_product.price_cents,
      'quantity', v_qty,
      'line_total_cents', v_product.price_cents * v_qty
    );
  END LOOP;

  -- 4. Shipping + total (server authoritative)
  IF v_subtotal >= p_free_shipping_threshold THEN
    v_shipping := 0;
  ELSE
    v_shipping := p_flat_shipping;
  END IF;
  v_total := v_subtotal + v_shipping;

  -- 5. Create order
  v_order_number := 'ME-' || to_char(nextval('order_number_seq'), 'FM000000');
  v_access_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO orders (
    order_number, customer_name, customer_email, customer_phone,
    address_line, street, city, state, pincode,
    subtotal_cents, shipping_cents, discount_cents, total_cents, currency,
    status, payment_status, payment_provider, payment_method,
    idempotency_key, access_token
  ) VALUES (
    v_order_number, p_customer_name, lower(p_customer_email), p_customer_phone,
    p_address_line, p_street, p_city, p_state, p_pincode,
    v_subtotal, v_shipping, 0, v_total, 'INR',
    'pending', 'unpaid', 'cash-on-delivery', 'cod',
    nullif(p_idempotency_key, ''), v_access_token
  )
  RETURNING * INTO v_order;

  -- 6. Create order items
  INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents)
  SELECT v_order.id,
         (it->>'product_id')::uuid,
         it->>'product_name',
         (it->>'unit_price_cents')::integer,
         (it->>'quantity')::integer,
         (it->>'line_total_cents')::integer
  FROM jsonb_array_elements(v_items_result) it;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'subtotal_cents', v_order.subtotal_cents,
    'shipping_cents', v_order.shipping_cents,
    'total_cents', v_order.total_cents,
    'currency', v_order.currency,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'payment_method', v_order.payment_method,
    'access_token', v_order.access_token,
    'items', v_items_result,
    'idempotent', false
  );
END $$;

REVOKE ALL ON FUNCTION create_order(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_order(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer) FROM anon;
REVOKE ALL ON FUNCTION create_order(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION create_order(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer) TO service_role;

-- ── Secure order lookup ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_order(p_order_number text, p_access_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_items jsonb;
BEGIN
  SELECT * INTO v_order FROM orders
  WHERE order_number = p_order_number AND access_token = p_access_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'product_name', product_name,
    'unit_price_cents', unit_price_cents,
    'quantity', quantity,
    'line_total_cents', line_total_cents
  )), '[]'::jsonb) INTO v_items FROM order_items WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'customer_name', v_order.customer_name,
    'customer_email', v_order.customer_email,
    'customer_phone', v_order.customer_phone,
    'address_line', v_order.address_line,
    'street', v_order.street,
    'city', v_order.city,
    'state', v_order.state,
    'pincode', v_order.pincode,
    'subtotal_cents', v_order.subtotal_cents,
    'shipping_cents', v_order.shipping_cents,
    'total_cents', v_order.total_cents,
    'currency', v_order.currency,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'payment_method', v_order.payment_method,
    'created_at', v_order.created_at,
    'items', v_items
  );
END $$;

REVOKE ALL ON FUNCTION get_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order(text, text) TO anon, authenticated, service_role;
