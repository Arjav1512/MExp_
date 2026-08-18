# Social Proof & Trust Layer

Four trust experiences added to the storefront, in this homepage order:
Brand story → **Trustpilot** → **Amazon** → **Customer Feedback** → **Instagram** → Purchase CTA.

Nothing in this layer fabricates ratings, reviews, or influencer content. Each external
integration shows one honest status: real data when connected, an honest fallback when not.

## 1. Trustpilot (independent reviews)

- Loads Trustpilot's official widget script and renders the official TrustBox.
- **Status is LIVE only when `VITE_TRUSTPILOT_BUSINESS_UNIT_ID` is set.** Otherwise it shows a
  "Review us on Trustpilot" call-to-action — never a fake star count.
- Optional env vars:
  - `VITE_TRUSTPILOT_BUSINESS_UNIT_ID` (required to go live) — from your Trustpilot Business account.
  - `VITE_TRUSTPILOT_TEMPLATE_ID` — widget template ID (defaults to the standard collector widget).
  - `VITE_TRUSTPILOT_DOMAIN` — your reviewed domain (defaults to `makhana-express.com`).
  - `VITE_TRUSTPILOT_REVIEW_URL` — override the "leave a review" link.

## 2. Amazon (marketplace listing)

- Product ASIN **B0H6C1FYSR** on `www.amazon.in`. Always shows the real product identity and a
  correct "View on Amazon" / "Read Amazon reviews" link to `https://www.amazon.in/dp/B0H6C1FYSR`.
- **Live star ratings and review excerpts are intentionally NOT shown** — that requires an approved
  Amazon data source (PA-API or an approved review widget) which is not wired up. We never invent a
  rating. An honest note explains that live ratings appear once the integration is connected.
- Optional env vars: `VITE_AMAZON_ASIN`, `VITE_AMAZON_MARKETPLACE`.

## 3. Customer Feedback (native, moderated) — FULLY LIVE

First-party reviews collected, moderated, and displayed by the app itself.

**How it works**
- Visitors submit a review (rating, name, optional headline, body, optional order verification).
- Every review is stored as `pending` and is invisible to the public until an admin approves it.
- The public site reads only `approved` reviews. Overall rating, count, and a rating distribution
  (shown once there are at least 5 reviews) are computed from real approved reviews only.
- If a submitter proves their purchase (order number + order code), the review is flagged
  **Verified** — this flag is set by the server only, never by the browser.

**Data & security**
- Table `customer_reviews` has row-level security enabled with a single public policy:
  read access to rows where `status = 'approved'`. There are **no** write policies, so the browser
  (anon key) cannot insert, update, approve, feature, or delete anything.
- All writes happen server-side through two edge functions using the service role:
  - `submit-review` (public): validates and cleans input, enforces a per-IP rate limit
    (3 submissions / 10 min), verifies purchase against real orders, always stores as `pending`,
    and blocks duplicate reviews for the same order.
  - `moderate-review` (admin only): list / approve / reject / feature / unfeature / delete.
    Protected by an admin API key.

**Admin / moderation workflow**
1. Set the edge-function secret `ADMIN_API_KEY` to a long random string.
   *Until this is set, the moderation function returns "configuration required" and cannot be used.*
2. List pending reviews:
   `GET {SUPABASE_URL}/functions/v1/moderate-review?status=pending`
   with header `Authorization: Bearer <ADMIN_API_KEY>`.
3. Act on one:
   `POST {SUPABASE_URL}/functions/v1/moderate-review`
   body `{ "id": "<review-id>", "action": "approve" }`
   (`action` ∈ `approve` | `reject` | `feature` | `unfeature` | `delete`).
4. Approved reviews appear on the site immediately; featured ones sort to the front.

## 4. Instagram (community)

- Live "Follow @makhanaexpress" button linking to the real profile.
- **No fabricated influencer cards.** A placeholder grid plus an honest note explain that the live
  feed and approved creator features will appear once the official Instagram embed is connected.
- Optional env var: `VITE_INSTAGRAM_HANDLE`.

## Required credentials summary

| Integration      | Needed to go fully live                              | Where |
|------------------|------------------------------------------------------|-------|
| Trustpilot       | `VITE_TRUSTPILOT_BUSINESS_UNIT_ID`                   | site env vars |
| Amazon ratings   | Approved Amazon data source (not env alone)          | (future) |
| Customer Feedback| `ADMIN_API_KEY` (to moderate) — display already live | edge-function secret |
| Instagram feed   | Official Instagram embed / Graph connection          | (future) |

## Public vs. server-only configuration

- **Public (safe to expose, prefix `VITE_`, set in the hosting env / Vercel):**
  `VITE_TRUSTPILOT_BUSINESS_UNIT_ID`, `VITE_TRUSTPILOT_TEMPLATE_ID`, `VITE_TRUSTPILOT_DOMAIN`,
  `VITE_TRUSTPILOT_REVIEW_URL`, `VITE_AMAZON_ASIN`, `VITE_AMAZON_MARKETPLACE`,
  `VITE_INSTAGRAM_HANDLE`, plus the existing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
  These are public identifiers by design (widget IDs, a public listing ASIN, a public handle).
- **Server-only secrets (NEVER `VITE_`, NEVER in the browser, set as Supabase edge-function secrets):**
  `ADMIN_API_KEY` (review moderation). The Supabase service-role key and Resend keys are already
  server-only. No secret is ever read by frontend code.

Current status of the moderation secret: **`ADMIN_API_KEY` is not set yet.** Review submission and
public display work without it; approving/rejecting reviews is disabled until an operator adds it.

## Performance & accessibility

- Trustpilot's script is injected once, asynchronously, and only when a business ID is configured —
  it never blocks first paint. The whole social-proof block is code-split and loaded lazily.
- All images carry explicit width/height to avoid layout shift.
- The reviews carousel is a labelled, keyboard-focusable region; star inputs and all buttons have
  accessible names; form fields have labels and accessible validation messages.
- The site now honours the operating-system "reduce motion" preference globally: motion is minimised
  for visitors who request it.

## Known limitations

- Amazon live ratings and Instagram live feed are built as production-ready components with honest
  fallbacks; they require external business approvals/integrations that are not configured here.
- `ADMIN_API_KEY` is not set yet, so review moderation is not usable until an operator adds it.
- Verified-purchase matching relies on the customer entering their order number and order code.
