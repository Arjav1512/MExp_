// =============================================================================
// INTEGRATION CONFIGURATION LAYER
// -----------------------------------------------------------------------------
// Single source of truth for the state of every third-party trust integration.
// Each integration reports one honest status. Nothing here fabricates ratings,
// review counts, or influencer content — a section only claims LIVE when the
// credentials/data required to show REAL data are actually present.
//
//   live                    — configured; real external data can be shown
//   configuration_required  — the component is built, but an operator must add
//                             credentials/IDs before real data can load
//   unavailable             — intentionally off
//   error                   — configured but failed to load at runtime
// =============================================================================

export type IntegrationStatus =
  | 'live'
  | 'configuration_required'
  | 'unavailable'
  | 'error';

const env = import.meta.env;

function trimmed(value: string | undefined): string {
  return (value ?? '').trim();
}

// ── Trustpilot ───────────────────────────────────────────────────────────────
export interface TrustpilotConfig {
  status: IntegrationStatus;
  businessUnitId: string;
  templateId: string;
  domain: string;
  reviewUrl: string;
}

export function trustpilotConfig(): TrustpilotConfig {
  const businessUnitId = trimmed(env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID);
  const domain = trimmed(env.VITE_TRUSTPILOT_DOMAIN) || 'makhana-express.com';
  return {
    status: businessUnitId ? 'live' : 'configuration_required',
    businessUnitId,
    // Default template is Trustpilot's standard "Review Collector" horizontal widget.
    templateId: trimmed(env.VITE_TRUSTPILOT_TEMPLATE_ID) || '5419b6a8b0d04a076446a9ad',
    domain,
    reviewUrl:
      trimmed(env.VITE_TRUSTPILOT_REVIEW_URL) ||
      `https://www.trustpilot.com/review/${domain}`,
  };
}

// ── Amazon ─────────────────────────────────────────────────────────────────--
// The product IDENTITY (ASIN, listing link) is always known and always shown.
// Ratings / review excerpts require an approved Amazon data source (PA-API or an
// approved review widget), which is not wired up — so `reviewsStatus` stays
// configuration_required and we NEVER invent a star count.
export interface AmazonConfig {
  asin: string;
  marketplace: string;
  productUrl: string;
  identityStatus: IntegrationStatus;
  reviewsStatus: IntegrationStatus;
}

export function amazonConfig(): AmazonConfig {
  const asin = trimmed(env.VITE_AMAZON_ASIN) || 'B0H6C1FYSR';
  const marketplace = trimmed(env.VITE_AMAZON_MARKETPLACE) || 'www.amazon.in';
  return {
    asin,
    marketplace,
    productUrl: `https://${marketplace}/dp/${asin}`,
    identityStatus: 'live',
    reviewsStatus: 'configuration_required',
  };
}

// ── Instagram ─────────────────────────────────────────────────────────────---
// The follow CTA to the real handle is always live. Featuring specific
// influencer posts requires the official Instagram oEmbed/Graph integration and
// creator permission, which is not configured — so influencer content stays
// configuration_required and we present ZERO fabricated influencer cards.
export interface InstagramConfig {
  handle: string;
  profileUrl: string;
  followStatus: IntegrationStatus;
  contentStatus: IntegrationStatus;
}

export function instagramConfig(): InstagramConfig {
  const handle = (trimmed(env.VITE_INSTAGRAM_HANDLE) || 'makhanaexpress').replace(/^@/, '');
  return {
    handle,
    profileUrl: `https://www.instagram.com/${handle}/`,
    followStatus: 'live',
    contentStatus: 'configuration_required',
  };
}
