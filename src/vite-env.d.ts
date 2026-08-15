/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PUBLIC_URL?: string;

  // Trustpilot official TrustBox widget (all optional; section self-disables when absent)
  readonly VITE_TRUSTPILOT_BUSINESS_UNIT_ID?: string;
  readonly VITE_TRUSTPILOT_TEMPLATE_ID?: string;
  readonly VITE_TRUSTPILOT_DOMAIN?: string;
  readonly VITE_TRUSTPILOT_REVIEW_URL?: string;

  // Amazon product identity (ASIN is fixed to the real Makhana Express listing)
  readonly VITE_AMAZON_ASIN?: string;
  readonly VITE_AMAZON_MARKETPLACE?: string;

  // Instagram community
  readonly VITE_INSTAGRAM_HANDLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
