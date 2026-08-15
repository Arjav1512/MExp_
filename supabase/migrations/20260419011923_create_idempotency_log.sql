/*
  # Create idempotency_log table

  ## Purpose
  Stores idempotency keys for the send-welcome-email edge function so that
  duplicate requests (same email submitted multiple times, network retries,
  browser double-submits) return the same cached response instead of
  re-processing the request. Entries expire after 10 minutes.

  ## New Tables

  ### idempotency_log
  - `key`         (text, PK)    — SHA-256 of normalized email; unique per 10-min window
  - `status`      (int)         — HTTP status code of the original response
  - `body`        (jsonb)       — Response body of the original response
  - `created_at`  (timestamptz) — When the entry was first created

  ## Indexes
  - Primary key on `key` for O(1) lookup
  - Index on `created_at` to support efficient TTL cleanup queries

  ## Security
  - RLS enabled
  - Only the service role (edge function via service key) can read/write
  - No authenticated or anon access allowed
*/

CREATE TABLE IF NOT EXISTS idempotency_log (
  key        text PRIMARY KEY,
  status     integer NOT NULL,
  body       jsonb   NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_log_created_at
  ON idempotency_log (created_at DESC);

ALTER TABLE idempotency_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only insert idempotency"
  ON idempotency_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role only select idempotency"
  ON idempotency_log
  FOR SELECT
  TO service_role
  USING (true);
