/*
  # Rate limit counters and email delivery log

  ## Summary
  This migration adds two new tables to support distributed rate limiting and
  email delivery observability.

  ---

  ## 1. rate_limit_counters

  Replaces the in-memory Map-based rate limiter in the edge function with a
  distributed, Postgres-backed sliding-window counter. Because all edge function
  isolates share the same Postgres instance, this counter is correct across every
  concurrent isolate — unlike module-level Maps which are per-isolate only.

  Each row tracks one (key, window_start) pair. The edge function performs a
  single atomic UPDATE...RETURNING to increment the counter inside the current
  window, or an INSERT to start a new window. The INSERT uses ON CONFLICT to
  handle races safely.

  ### Columns
  - `key`          (text PK)       — rate-limit bucket: "ip:<address>" or "email:<hash>"
  - `count`        (int, NOT NULL) — requests seen in the current window
  - `window_start` (timestamptz)   — when the current window began
  - `updated_at`   (timestamptz)   — last increment timestamp

  ---

  ## 2. email_delivery_log

  Stores every Resend webhook event so delivery status is observable and
  auditable. The resend-webhook edge function writes here.

  ### Columns
  - `id`           (uuid PK)   — internal row ID
  - `message_id`   (text)      — Resend message ID (from send response)
  - `email`        (text)      — recipient address (normalised, lowercase)
  - `event`        (text)      — Resend event type: delivered, bounced, complained, opened, clicked, etc.
  - `event_data`   (jsonb)     — full raw webhook payload for the event
  - `created_at`   (timestamptz) — when the event was received

  ### Indexes
  - `message_id` — fast lookup by Resend ID
  - `email`      — fast lookup by recipient

  ---

  ## 3. idempotency_log update

  Adds an `idempotency_key_type` column so we can distinguish client-supplied
  keys from email-derived keys in logs and audits.

  ---

  ## Security
  - RLS enabled on both new tables
  - Only service_role can read/write (edge functions run with service key)
  - No anon or authenticated access
*/

-- ─── rate_limit_counters ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key          text        PRIMARY KEY,
  count        integer     NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rlc_window_start ON rate_limit_counters (window_start);

ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only insert rate_limit_counters"
  ON rate_limit_counters FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only select rate_limit_counters"
  ON rate_limit_counters FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only update rate_limit_counters"
  ON rate_limit_counters FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role only delete rate_limit_counters"
  ON rate_limit_counters FOR DELETE TO service_role USING (true);

-- ─── email_delivery_log ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_delivery_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  text        NOT NULL,
  email       text        NOT NULL DEFAULT '',
  event       text        NOT NULL,
  event_data  jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edl_message_id ON email_delivery_log (message_id);
CREATE INDEX IF NOT EXISTS idx_edl_email      ON email_delivery_log (email);
CREATE INDEX IF NOT EXISTS idx_edl_event      ON email_delivery_log (event);
CREATE INDEX IF NOT EXISTS idx_edl_created_at ON email_delivery_log (created_at DESC);

ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only insert email_delivery_log"
  ON email_delivery_log FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only select email_delivery_log"
  ON email_delivery_log FOR SELECT TO service_role USING (true);

-- ─── idempotency_log — add key_type column ───────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'idempotency_log' AND column_name = 'key_type'
  ) THEN
    ALTER TABLE idempotency_log
      ADD COLUMN key_type text NOT NULL DEFAULT 'email_derived';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'idempotency_log' AND column_name = 'message_id'
  ) THEN
    ALTER TABLE idempotency_log
      ADD COLUMN message_id text;
  END IF;
END $$;
