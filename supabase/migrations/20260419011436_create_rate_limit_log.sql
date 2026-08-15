/*
  # Create rate_limit_log table

  ## Purpose
  Tracks email submission attempts per IP address to enforce server-side rate limiting
  in the send-welcome-email edge function. Prevents abuse without relying solely on
  client-side throttling.

  ## New Tables

  ### rate_limit_log
  - `id` (uuid, PK) — unique row identifier
  - `ip` (text) — hashed or raw IP address of the requester
  - `action` (text) — the action being rate-limited (e.g., 'newsletter_subscribe')
  - `created_at` (timestamptz) — when the attempt was recorded

  ## Indexes
  - Index on (ip, action, created_at) for fast time-window lookups

  ## Security
  - RLS enabled
  - Only the service role (edge function) can insert/select rows
  - No authenticated or anon access
*/

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  action text NOT NULL DEFAULT 'newsletter_subscribe',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_log_lookup
  ON rate_limit_log (ip, action, created_at DESC);

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only insert"
  ON rate_limit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role only select"
  ON rate_limit_log
  FOR SELECT
  TO service_role
  USING (true);
