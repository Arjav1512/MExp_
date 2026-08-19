# Makhana Express

E-commerce website for [Makhana Express](https://makhana-express.com/) — a premium, preservative-free makhana brand sourced from Bihar's Mithila wetlands.

---

## Features

- Animated hero with an interactive flavor card stack (hover/tap to fan out)
- Product showcase across three flavors: Classic, Peri Peri, Black Pepper
- Brand story — sourcing, fair trade, Bihar farming families
- Newsletter signup → Supabase insert → Resend welcome email
- Rate limiting, idempotency, and honeypot spam protection on the email flow
- Analytics events (page views, CTA clicks, signups) logged to Supabase

---

## Tech

| Layer | Tool |
|---|---|
| UI | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase |
| Email | Resend (edge function + webhook) |
| Icons | Lucide React |

---

## Project Structure

```
src/
  components/       # UI sections (Hero, Newsletter, ProductShowcase, etc.)
  lib/              # Supabase client, analytics, email validation, motion presets, router
  App.tsx           # Root — wires pages and modal
  main.tsx

supabase/
  functions/
    send-welcome-email/   # Validates, rate-limits, sends via Resend
    resend-webhook/       # Handles Resend delivery events
  migrations/             # DB schema, RLS policies, rate limit tables
```

---

## Setup

**1. Clone and install**
```bash
git clone https://github.com/Arjav1512/MExp_.git
cd MExp_
npm install
```

**2. Environment variables**

`.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase Edge Function secrets (set in project dashboard):
```
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
```

**3. Database**
```bash
supabase db push
```

Creates `newsletter_subscribers`, `analytics_events`, `error_logs`, `rate_limit_log`, `idempotency_log` with RLS policies configured.

**4. Dev server**
```bash
npm run dev
```

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run preview      # preview build
npm run lint         # ESLint
npm run typecheck    # TS check (no emit)
```

---

## Email Flow

1. Email inserted into `newsletter_subscribers`
2. `send-welcome-email` edge function fires
3. Rate limit + idempotency check (no duplicate sends)
4. Resend delivers the welcome email
5. Delivery events return via `resend-webhook` and get logged

Client-side: 60s cooldown between submissions + honeypot field to drop bots before they hit Supabase.

---

## Notes

- RLS: anon users can insert to the newsletter table only — no reads
- Router is a minimal custom implementation (`src/lib/router.ts`) — no React Router
- Product images in `/public` are the live brand shots used on site
