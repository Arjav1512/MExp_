/*
# Makhana Express Commerce Schema

Adds the core tables that power the direct-to-consumer shopping experience:
a public product catalog plus a secure order pipeline. The catalog is readable
by anyone (so the storefront can list products), while orders — which contain
customer personal information — are locked down and can only be created by the
server-side order function, never read or written directly by the browser.

## 1. New Tables

### `products`
- `id` (uuid, primary key)
- `slug` (text, unique) — URL/lookup key, e.g. "the-classic"
- `name` (text) — display name
- `tagline` (text) — short marketing line
- `description` (text) — long description
- `price_cents` (integer) — unit price in paise (INR minor unit)
- `currency` (text, default 'INR')
- `weight_grams` (integer) — pack weight
- `image_url` (text) — primary image
- `gallery` (jsonb) — array of image URLs for the gallery
- `benefits` (jsonb) — array of benefit strings
- `ingredients` (jsonb) — array of ingredient strings
- `nutrition` (jsonb) — array of {label, value} nutrition rows
- `is_active` (boolean, default true) — whether it can be purchased
- `stock` (integer, default 0) — inventory-ready counter
- `sort_order` (integer, default 0)
- `created_at` (timestamptz)

### `orders`
- `id` (uuid, primary key)
- `order_number` (text, unique) — human-friendly reference (e.g. ME-XXXXXX)
- `customer_name` (text)
- `customer_email` (text)
- `customer_phone` (text)
- `address_line` (text) — house / flat
- `street` (text)
- `city` (text)
- `state` (text)
- `pincode` (text)
- `subtotal_cents` (integer) — sum of item line totals, computed server-side
- `shipping_cents` (integer) — shipping charge, computed server-side
- `discount_cents` (integer, default 0) — coupon reduction, reserved for future
- `total_cents` (integer) — final amount, computed server-side
- `currency` (text, default 'INR')
- `status` (text, default 'pending') — order lifecycle: pending/paid/fulfilled/cancelled
- `payment_status` (text, default 'unpaid') — unpaid/paid/failed/refunded
- `payment_provider` (text) — reserved for the payment provider name
- `payment_reference` (text) — reserved for gateway transaction id
- `created_at` (timestamptz)

### `order_items`
- `id` (uuid, primary key)
- `order_id` (uuid, fk -> orders, cascade delete)
- `product_id` (uuid, fk -> products)
- `product_name` (text) — snapshot of name at purchase time
- `unit_price_cents` (integer) — snapshot of price at purchase time
- `quantity` (integer)
- `line_total_cents` (integer)

## 2. Security

- RLS is ENABLED on all three tables.
- `products`: a single SELECT policy grants read access to anon + authenticated
  because the catalog is intentionally public. There are deliberately NO
  insert/update/delete policies, so the storefront cannot mutate the catalog.
- `orders` and `order_items`: RLS is enabled and NO policies are added. This
  means the anon-key browser client can neither read nor write these tables —
  they are reachable only through the `create-order` edge function, which uses
  the privileged service role. This prevents any customer's personal details
  or order history from being exposed to other visitors.

## 3. Notes

1. Prices are stored in the smallest currency unit (paise) as integers to avoid
   floating point rounding errors.
2. All money totals on an order are computed and written by the server function,
   never trusted from the client.
3. The schema leaves room for future growth: `stock` supports inventory,
   `discount_cents`/coupon support is reserved, and product `gallery`,
   `benefits`, `ingredients`, and `nutrition` are flexible JSON.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  weight_grams integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  nutrition jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  stock integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  address_line text NOT NULL,
  street text NOT NULL DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  subtotal_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_provider text NOT NULL DEFAULT '',
  payment_reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total_cents integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, sort_order);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
