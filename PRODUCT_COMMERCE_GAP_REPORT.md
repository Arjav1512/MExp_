# Product Commerce Gap Report — Makhana Express

This report compares what the storefront showed **before** against the real
Amazon listing (ASIN B0H6C1FYSR, see `AMAZON_PRODUCT_SOURCE.md`), and records how
each gap was closed. Design was preserved throughout — only product truth and
information completeness changed.

## Summary

The old product was a generic "natural makhana" concept: a single price, a short
benefits list, basic ingredients and nutrition. The Amazon listing is a specific
SKU — plain 250 g phool makhana at ₹390 (MRP ₹499) — with a fuller spec sheet.
The store now carries that exact SKU with Amazon-level information completeness,
still presented in the Makhana Express visual language.

## Gap table

| Area | Before | After (synced) |
|------|--------|----------------|
| Product name | Generic "The Classic" | Plain Phool Makhana |
| Slug | `the-classic` | `plain-phool-makhana` |
| Price | Single price only | ₹390 selling price |
| MRP / savings | None | ₹499 MRP, 22% off, "you save ₹109" shown |
| Unit price | None | ₹156 per 100 g shown |
| Pack size | "…g pack" | "250 g (Pack of 1)" throughout cart & checkout |
| Flavour / diet | Not stated | Unflavoured, Vegetarian |
| Ingredients | Generic | Single ingredient: Makhana (Phool Makhana / Fox Nuts) |
| Nutrition | Partial, unlabeled basis | Full 10-row panel, labeled "Per 100 g" |
| Claims | A few benefits | Gluten Free, High Protein, High Calcium, Handpicked, Bihar-sourced, etc. as chips |
| Specifications | None | Net weight, dimensions, origin, manufacturer, packer, storage, shelf life |
| How to use | None | Step-by-step "how to enjoy" |
| Delivery info | None | Pincode check + free-shipping threshold + COD note |
| FAQ | None | Six-question accordion built from the product facts |
| SEO / structured data | Generic site meta | Product title/description + `Product` structured data (price, availability, origin) |

## What was intentionally NOT changed

- **Design and brand.** Colours, typography, spacing, animations, and layout
  language are unchanged. The page does not look like Amazon; it reads as
  Makhana Express.
- **The honest COD payment path.** Orders are still Cash on Delivery, created
  `unpaid`, and priced server-side. No card/UPI charge is faked.
- **No fabricated social proof.** Amazon's star rating and review count are not
  shown as first-party content and are not injected into structured data.
- **Decorative flavour cards on the home page** (Peri Peri / Black Pepper /
  Classic) were left as brand storytelling — they carry no prices or SKUs, so
  they cannot be mistaken for purchasable variants.

## Data-layer changes

- An additive-only migration added spec columns (brand, flavour, dietary,
  `mrp_cents`, `pack_size`, dimensions, origin, manufacturer, packer, shelf life,
  storage, nutrition basis, claims, how-to-use). No columns were dropped or
  retyped, so no existing data was lost.
- The single product row was updated in place to the verified Amazon values and
  its stock reset to a clean baseline of 500.

## Verification

Build, type-check, and lint pass (one pre-existing non-blocking warning in the
cart file). The real-user E2E suite now runs 30 checks — 12 of them assert the
product matches the Amazon listing — and all 30 pass. See
`E2E_ORDERING_TEST_REPORT.md`.
