/*
  # Fix RLS Policies — Remove Always-True WITH CHECK Clauses

  ## Problem
  Three tables had INSERT policies with `WITH CHECK (true)`, which effectively
  bypasses row-level security and allows unrestricted writes from anonymous users,
  including malformed or malicious payloads.

  ## Changes

  ### analytics_events
  - Drop the always-true anon INSERT policy
  - Replace with a constrained policy that requires:
    - `event` is non-empty (trimmed length > 0)

  ### error_logs
  - Drop the always-true anon INSERT policy
  - Replace with a constrained policy that requires:
    - `message` is non-empty (trimmed length > 0)

  ### newsletter_subscribers
  - Drop the always-true anon INSERT policy
  - Replace with a constrained policy that requires:
    - `email` matches a basic email pattern (contains @ and a dot after @)
    - `is_active` must be true (prevents subscribing as inactive)

  ## Security Notes
  - Anonymous users can still insert, but only well-formed rows pass the check
  - Garbage payloads (empty strings, null bypasses) are rejected at DB level
  - No authenticated-only data is exposed; SELECT policies are unchanged
*/

-- analytics_events: replace always-true policy
DROP POLICY IF EXISTS "Anon can insert analytics events" ON analytics_events;

CREATE POLICY "Anon can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (
    length(trim(event)) > 0
  );

-- error_logs: replace always-true policy
DROP POLICY IF EXISTS "Anon can insert error logs" ON error_logs;

CREATE POLICY "Anon can insert error logs"
  ON error_logs
  FOR INSERT
  TO anon
  WITH CHECK (
    length(trim(message)) > 0
  );

-- newsletter_subscribers: replace always-true policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND is_active = true
  );
