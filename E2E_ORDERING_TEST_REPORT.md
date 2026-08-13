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

## Result: 18 / 18 checks passed

| # | Check | Result |
|---|-------|--------|
| 1 | Storefront loads an active product | PASS |
| 2 | Product stock is readable and positive | PASS |
| 3 | New user can place a COD order | PASS |
| 4 | Server is authoritative for pricing (returned total = server-computed) | PASS |
| 5 | COD order is `unpaid` / method `cod` (due on delivery) | PASS |
| 6 | Order returns an access token + itemised lines | PASS |
| 7 | Inventory decremented by exactly the quantity ordered | PASS |
| 8 | Duplicate submit (same idempotency key) returns the same order | PASS |
| 9 | Duplicate submit does NOT decrement stock again | PASS |
| 10 | Order retrievable with the correct token | PASS |
| 11 | Order NOT retrievable with a wrong token | PASS |
| 12 | Order NOT retrievable without a token (no enumeration) | PASS |
| 13 | Oversell rejected — cannot exceed stock (`INSUFFICIENT_STOCK`) | PASS |
| 14 | Rejected oversell leaves inventory unchanged (no partial decrement) | PASS |
| 15 | Unconfigured card payment refused (no fake charge) | PASS |
| 16 | Invalid pincode rejected (HTTP 400) | PASS |
| 17 | Invalid email rejected (HTTP 400) | PASS |
| 18 | `orders` table not publicly readable (anon sees 0 rows) | PASS |

## Definition-of-Done mapping

- **A brand-new user can order end to end** — checks 1–6.
- **Order, items, payment-state, inventory-state persisted correctly** —
  checks 4–7 (order number `ME-00xxxx`, itemised lines, `unpaid` COD state,
  stock decremented by exactly the quantity).
- **No manipulation possible** — check 4 (server-authoritative pricing),
  check 15 (payment method can't be forged into a "paid" state),
  checks 11–12 & 18 (no reading others' orders, no enumeration).
- **No duplicate orders** — checks 8–9 (idempotency).
- **No negative inventory** — checks 13–14 (oversell rejected, full rollback,
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
