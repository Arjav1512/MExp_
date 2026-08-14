# Commerce Implementation Report — Makhana Express

This documents how the ordering system was hardened from a demo checkout into a
production-grade path. Nothing on the critical ordering path is mocked,
simulated, or hardcoded.

## 1. Order placement is atomic and server-authoritative

All order creation goes through a single Postgres `SECURITY DEFINER` function,
`create_order(...)`, invoked only by the `create-order` edge function using the
service-role key. The browser can never call it directly.

- `create_order` is **granted only to `service_role`**. Verified: `anon` and
  `authenticated` both return `false` for `has_function_privilege(... 'EXECUTE')`.
- The function computes **all money server-side** from the `products` table:
  line totals, subtotal, shipping (free at/above `49900` paise, otherwise
  `4900`), and grand total. The client cannot influence pricing — it only sends
  `product_id` + `quantity`. The E2E test confirms the returned total equals the
  server-computed expectation.
- Everything (stock check, stock decrement, order row, order_items rows) happens
  in one function invocation, so a failure leaves **no partial order**.

## 2. Inventory is real and cannot go negative

- `products.stock` is a live integer. `create_order` locks each product row with
  `FOR UPDATE`, checks `stock >= requested`, and decrements it in the same
  transaction.
- If any line would drive stock below zero, the function raises
  `INSUFFICIENT_STOCK` and the **entire transaction rolls back** — no line is
  decremented. Verified end-to-end: an over-quantity order was rejected and stock
  was unchanged afterwards (no partial decrement).
- Row locking (`FOR UPDATE`) serialises concurrent orders for the same product,
  so two simultaneous buyers cannot both pass the `stock >=` check on the last
  unit.

## 3. Duplicate orders are impossible (idempotency)

- `orders.idempotency_key` has a unique index. The checkout screen generates one
  stable key per checkout attempt (held in a ref) and sends it with every submit.
- On replay with the same key, `create_order` returns the **existing** order and
  sets `idempotent: true` — no second order row, no second stock decrement, no
  second confirmation email. Verified: double-submit returned the same
  `order_number` and stock did not move again.
- The "Place order" button is also disabled while a request is in flight, and the
  handler early-returns if already processing — belt and braces on top of the
  server guarantee.

## 4. Payment reality — COD is genuinely wired, card/UPI are not faked

No card/UPI payment gateway secret is configured for this project (only Resend
email keys exist). Rather than fake a charge:

- **Cash on Delivery is the only working method.** The order is created with
  `payment_status = 'unpaid'` and the customer is told the amount is **due on
  delivery** — never "paid".
- `create_order` **rejects any non-COD method** with
  `PAYMENT_METHOD_UNAVAILABLE`. Verified: a `card` request was refused with that
  code — the system will not record a paid order it cannot actually collect.
- The checkout UI shows Card and UPI as "Soon" and disables them, so they can't
  be selected. The old client-side payment simulator was removed from the
  ordering path.

## 5. Secure order retrieval — no public enumeration

- The `orders` and `order_items` tables have RLS enabled with **no policies**, so
  the anon/authenticated Data API returns nothing. Verified: an anon
  `SELECT * FROM orders` returns zero rows.
- Retrieval goes through `get_order(order_number, access_token)`, a
  `SECURITY DEFINER` function that returns the order **only if the unguessable
  `access_token` matches**. A wrong token, an empty token, a null token, or an
  unknown order number all return `NULL`. Sequential order numbers
  (`ME-001002`, `ME-001003`, …) are therefore useless without the token.

## 6. Confirmation email is connected

- On a genuinely new order (not an idempotent replay), the edge function sends a
  confirmation email via Resend, itemised, with the correct COD wording
  ("Total due on delivery"). Email sending is wrapped so a mail failure can never
  fail an otherwise-valid order, and it is skipped on idempotent replays so a
  customer isn't emailed twice.

## 6b. Product data synced to the real Amazon listing

The purchasable product now mirrors the live Amazon SKU (ASIN B0H6C1FYSR): "Plain
Phool Makhana", 250 g (pack of 1), ₹390 against a ₹499 MRP (22% off, ₹156 per
100 g), single makhana ingredient, full per-100 g nutrition, plus specifications,
claims, how-to-use and an FAQ. The product page was rebuilt to Amazon-level
information completeness but kept entirely in the Makhana Express visual
language — it does not look like Amazon. Amazon's star rating and reviews are
deliberately excluded (no fabricated social proof, and none placed in structured
data). Full detail and sourcing are in `AMAZON_PRODUCT_SOURCE.md` and
`PRODUCT_COMMERCE_GAP_REPORT.md`. All order pricing is still computed
server-side; the displayed price/MRP are facts, not the charged amount.

## 7. Known intentional advisor findings

`get_advisors (security)` reports four items, all expected by design:

1. `rls_enabled_no_policy` on `orders` — intentional; orders are server-only.
2. `rls_enabled_no_policy` on `order_items` — intentional; same reason.
3/4. `get_order` is a `SECURITY DEFINER` function callable by `anon` /
   `authenticated` — intentional; it is the token-gated lookup gateway and is
   safe because it requires the secret `access_token`.

## 8. Verification status

- Build: passing.
- Type check: passing.
- Lint: no errors (one pre-existing non-blocking fast-refresh warning in the
  cart file).
- Database behaviour (atomicity, inventory, idempotency, secure lookup, payment
  refusal) **and product-data accuracy vs the Amazon listing**: verified — see
  `E2E_ORDERING_TEST_REPORT.md` (30/30 checks).
- Browser UI: not visually verified in this environment (no browser automation
  available here). The full public path was instead exercised programmatically
  through the exact same endpoints the browser uses.
