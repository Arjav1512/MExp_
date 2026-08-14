# End-to-End Ordering Test Report — Makhana Express

## What was tested and how

A real-user test harness (`scripts/e2e-order.mjs`, run with `node
scripts/e2e-order.mjs`) drives **only the public storefront surface** — the
exact endpoints a browser uses:

- the anon-key REST read for the product (`/rest/v1/products`),
- the `create-order` edge function (`/functions/v1/create-order`),
- the `get_order` RPC (`/rest/v1/rpc/get_order`).

It uses the **anon key only**. It never uses the service-role key and never
issues raw SQL against the ordering path. A pass therefore proves a brand-new
visitor can complete a genuine order. (Test fixtures created during the run were
cleaned up afterwards and `products.stock` was restored to its baseline of 500.)

## Result: 30 / 30 checks passed

Checks 3–14 confirm the storefront product data matches the real Amazon listing
(ASIN B0H6C1FYSR). Checks 15–30 are the ordering-path guarantees.

| # | Check | Result |
|---|-------|--------|
| 1 | Storefront loads an active product | PASS |
| 2 | Product stock is readable and positive | PASS |
| 3 | Product name is "Plain Phool Makhana" | PASS |
| 4 | Slug reflects the plain product | PASS |
| 5 | Net weight is 250 g | PASS |
| 6 | Pack size stated as "250 g (Pack of 1)" | PASS |
| 7 | Flavour is plain / unflavoured | PASS |
| 8 | Selling price is Rs 390 | PASS |
| 9 | MRP is Rs 499 and above selling price | PASS |
| 10 | Single ingredient is makhana / fox nuts | PASS |
| 11 | Nutrition facts present (per 100 g basis) | PASS |
| 12 | Country of origin is India | PASS |
| 13 | Manufacturer is recorded | PASS |
| 14 | Packer is recorded | PASS |
| 15 | New user can place a COD order | PASS |
| 16 | Server is authoritative for pricing (returned total = server-computed) | PASS |
| 17 | COD order is `unpaid` / method `cod` (due on delivery) | PASS |
| 18 | Order returns an access token + itemised lines | PASS |
| 19 | Inventory decremented by exactly the quantity ordered | PASS |
| 20 | Duplicate submit (same idempotency key) returns the same order | PASS |
| 21 | Duplicate submit does NOT decrement stock again | PASS |
| 22 | Order retrievable with the correct token | PASS |
| 23 | Order NOT retrievable with a wrong token | PASS |
| 24 | Order NOT retrievable without a token (no enumeration) | PASS |
| 25 | Oversell rejected — cannot exceed stock (`INSUFFICIENT_STOCK`) | PASS |
| 26 | Rejected oversell leaves inventory unchanged (no partial decrement) | PASS |
| 27 | Unconfigured card payment refused (no fake charge) | PASS |
| 28 | Invalid pincode rejected (HTTP 400) | PASS |
| 29 | Invalid email rejected (HTTP 400) | PASS |
| 30 | `orders` table not publicly readable (anon sees 0 rows) | PASS |

## Definition-of-Done mapping

- **Product data matches the real Amazon listing** — checks 3–14 (name, slug,
  250 g net weight, pack of 1, unflavoured, Rs 390 price / Rs 499 MRP, single
  makhana ingredient, per-100 g nutrition, India origin, manufacturer, packer).
- **A brand-new user can order end to end** — checks 15–18.
- **Order, items, payment-state, inventory-state persisted correctly** —
  checks 16–19 (order number `ME-00xxxx`, itemised lines, `unpaid` COD state,
  stock decremented by exactly the quantity).
- **No manipulation possible** — check 16 (server-authoritative pricing),
  check 27 (payment method can't be forged into a "paid" state),
  checks 23–24 & 30 (no reading others' orders, no enumeration).
- **No duplicate orders** — checks 20–21 (idempotency).
- **No negative inventory** — checks 25–26 (oversell rejected, full rollback,
  row-locked decrement).

## How to re-run

```
node scripts/e2e-order.mjs
```

Exit code `0` means all checks passed; `1` means at least one failed. Each run
creates one real order for `aarav.e2e@example.com`; delete rows with that email
and reset `products.stock` if you want a clean slate.

## Honest limitations

- The harness exercises the real network path (public REST + edge function +
  RPC) but is not a headless-browser click-through, because no browser
  automation tool was available in this environment. The endpoints, payloads,
  anon-key auth, and idempotency-key behaviour are identical to what the React
  checkout screen sends, so the ordering logic is fully covered; the visual
  rendering of the checkout wizard itself was not machine-verified here.
- Concurrency (two buyers racing for the last unit) is enforced by
  `SELECT ... FOR UPDATE` row locks in `create_order` and reasoned about rather
  than load-tested in this suite.
