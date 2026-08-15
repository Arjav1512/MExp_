/*
  # Customer Reviews — moderated first-party feedback

  1. New table: `customer_reviews`
     - `id` (uuid, pk)
     - `product_id` (uuid, nullable, fk -> products) — which product the review is about
     - `order_id` (uuid, nullable, fk -> orders) — set only when the review is tied
       to a verified purchase; drives the "Verified Purchase" badge
     - `customer_name` (text) — display name, length-bounded
     - `rating` (int) — 1..5 stars
     - `title` (text) — optional short headline, length-bounded
     - `body` (text) — the written review, length-bounded
     - `photo_url` (text, nullable) — optional image, reserved for a future
       moderated upload flow; never rendered as HTML
     - `is_verified` (boolean) — true only when a matching paid order was proven
       server-side; the browser can never set this
     - `status` (text) — moderation state: pending | approved | rejected.
       New reviews are always 'pending'; only 'approved' rows are ever public
     - `is_featured` (boolean) — lets an admin pin standout reviews
     - `created_at`, `reviewed_at` (timestamptz)

  2. Security (RLS)
     - RLS is ENABLED.
     - ONE public SELECT policy: anon + authenticated may read ONLY rows whose
       `status = 'approved'`. Pending and rejected reviews are never exposed.
     - There are deliberately NO insert/update/delete policies. The browser
       (anon key) therefore has no write path at all. All writes happen through
       the `submit-review` and `moderate-review` edge functions using the
       service role, which is how `status` and `is_verified` stay server-controlled
       and cannot be forged from the client. This mirrors the existing `orders`
       model.

  3. Integrity & anti-abuse
     - CHECK constraints bound rating to 1..5 and cap the length of every free-text
       column so a row cannot be used as bulk storage or carry an oversized payload.
     - A partial UNIQUE index guarantees at most one review per order, so a verified
       purchaser cannot flood the same order with reviews.
     - Indexes support the public "approved, newest first" query and per-product lookups.
*/

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  order_id uuid REFERENCES orders(id),
  customer_name text NOT NULL,
  rating integer NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL,
  photo_url text,
  is_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT customer_reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT customer_reviews_status_valid CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT customer_reviews_name_len CHECK (length(customer_name) BETWEEN 1 AND 80),
  CONSTRAINT customer_reviews_title_len CHECK (length(title) <= 120),
  CONSTRAINT customer_reviews_body_len CHECK (length(body) BETWEEN 1 AND 2000),
  CONSTRAINT customer_reviews_photo_len CHECK (photo_url IS NULL OR length(photo_url) <= 1024)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_reviews_one_per_order
  ON customer_reviews(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_reviews_public
  ON customer_reviews(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_product
  ON customer_reviews(product_id, status);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_reviews" ON customer_reviews;
CREATE POLICY "public_read_approved_reviews" ON customer_reviews FOR SELECT
  TO anon, authenticated USING (status = 'approved');
