# Amazon Product Source — Makhana Express "Plain Phool Makhana"

This file records the authoritative product facts used to sync the storefront,
and exactly where each fact came from. It is the single source of truth for
**product data**. The existing Makhana Express look and feel remains the source
of truth for **design** — nothing here changes the brand styling.

## Listing identity

| Field | Value |
|-------|-------|
| Marketplace | Amazon.in |
| ASIN | B0H6C1FYSR |
| Product title | Plain Phool Makhana |
| Brand | Makhana Express |
| Generic name | Phool Makhana / Fox Nuts |
| Flavour | Unflavoured (plain) |

## How the data was obtained

The Amazon product page could **not** be fetched programmatically in this
environment (the page fetch returned no usable content, and a web search only
surfaced other brands). To avoid inventing product details, the facts below were
supplied by the project owner directly from screenshots of the live listing and
are treated as verified. Where the listing did not state a value, the field is
marked "not stated" and was left conservative rather than guessed.

## Verified product facts (applied to the store)

| Attribute | Value |
|-----------|-------|
| Net quantity | 250 g (Pack of 1) |
| Net weight | 250 g |
| Selling price (this store) | ₹390 |
| MRP | ₹499 |
| Discount | ~22% off MRP |
| Unit price | ₹156 per 100 g (derived from ₹390 ÷ 250 g) |
| Ingredients | Makhana (Phool Makhana / Fox Nuts) — single ingredient |
| Diet type | Vegetarian |
| Country of origin | India |
| Manufacturer | Makhana Express |
| Packed by | Makhana Express |
| Sourcing | Handpicked, sourced from Bihar |

### Nutrition (per 100 g)

| Nutrient | Amount |
|----------|--------|
| Energy | 350 kcal |
| Protein | 9.7 g |
| Carbohydrate | 77 g |
| Dietary Fibre | 7.6 g |
| Total Fat | 0.1 g |
| Sugar | 0 g |
| Sodium | 210 mg |
| Potassium | 500 mg |
| Calcium | 500 mg |
| Magnesium | 67 mg |

### On-pack claims

Big size · Handpicked · Unflavoured · Vegetarian · Gluten Free · High Protein ·
High Calcium · Guilt-Free Snacking · Sourced from Bihar.

## Facts deliberately NOT copied to the store

To keep the storefront honest and first-party, the following Amazon-surface
details were **excluded**:

- **Star rating and review count** — these belong to Amazon shoppers, not to
  this store. They are not shown as first-party content and are **not** placed in
  structured data (no fabricated `aggregateRating` / `review`).
- **Amazon seller name, coupons, "deal of the day", and Prime badges** — these
  are marketplace mechanics, not product facts.
- **Any benefit or health claim not present on the listing** — no invented
  clinical or superlative claims.

## Pricing rationale

The store sells at ₹390 against a ₹499 MRP. That is a 22% saving and works out to
₹156 per 100 g — internally consistent with the values shown on the listing. All
order pricing remains computed server-side from the `products` table; these
figures are display facts, not the amount charged (the amount is recomputed by
the server at checkout).
