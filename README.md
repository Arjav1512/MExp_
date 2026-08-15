# Makhana Express

A landing page for a makhana (foxnut) snack brand — built to collect early-access signups before launch.

The product isn't live yet. The site is the product right now. It tells the brand story, shows the flavors coming, and captures emails with a welcome email fired on signup.

---

## What it does

- Animated hero with an interactive flavor card stack (hover/tap to fan out)
- Product showcase with three lifestyle shots
- Flavor spectrum section (Classic, Peri Peri, Black Pepper — all "Coming Soon")
- Mission page covering sourcing, fair trade, and Bihar farming families
- Newsletter signup that writes to Supabase and fires a Resend welcome email
- "Coming Soon" modal that intercepts shop CTAs and redirects to the newsletter
- Rate limiting, idempotency, and honeypot spam protection on the email flow
- Basic analytics events (page views, CTA clicks, newsletter submissions) logged to Supabase

---

## Tech

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations throughout)
- Supabase (database + edge functions)
- Resend (transactional email via a webhook + send function)
- Lucide React (icons)

---

## Project structure

```
src/
  components/       # All UI sections (Hero, Newsletter, ProductShowcase, etc.)
  lib/              # Supabase client, analytics, email validation, motion presets, router
  App.tsx           # Root — wires pages and the coming-soon modal
  main.tsx

supabase/
  functions/
    send-welcome-email/   # Edge function: validates, rate-limits, sends via Resend
    resend-webhook/       # Handles Resend delivery events
  migrations/             # All DB schema, RLS policies, rate limit tables
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Arjav1512/MExp_.git
cd MExp_
npm install
```

### 2. Environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The edge functions need these set in your Supabase project dashboard (under Edge Function secrets):

```
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
```

### 3. Database

Push the migrations to your Supabase project:

```bash
supabase db push
```

This creates the `newsletter_subscribers`, `analytics_events`, `error_logs`, `rate_limit_log`, `idempotency_log`, and related tables with RLS policies already configured.

### 4. Run locally

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev          # local dev server
npm run build        # production build
npm run preview      # preview the build
npm run lint         # ESLint
npm run typecheck    # TypeScript check without emitting
```

---

## Email flow

When someone subscribes:

1. Email + source get inserted into `newsletter_subscribers`
2. A request hits the `send-welcome-email` edge function
3. The function checks rate limits and idempotency (no duplicate sends)
4. Resend fires the welcome email
5. Resend delivery events come back via the `resend-webhook` function and get logged

There's also a client-side rate limit (60 seconds between submissions) and a honeypot field to catch bots before they even hit Supabase.

---

## Notes

- The shop is not live — all "Shop" CTAs open a modal that collects email instead
- Images in `/public` are the actual product/lifestyle shots used on the site
- The router is a minimal custom implementation (`src/lib/router.ts`) — no React Router dependency
- RLS policies are locked down: anon users can only insert to the newsletter table, not read from it
