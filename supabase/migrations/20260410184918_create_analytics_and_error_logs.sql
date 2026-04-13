/*
  # Create Analytics Events and Error Logs Tables

  ## New Tables

  ### analytics_events
  - `id` (uuid, primary key)
  - `event` (text) - event name, e.g. 'page_view', 'cta_click'
  - `properties` (jsonb) - arbitrary event metadata
  - `created_at` (timestamptz)

  ### error_logs
  - `id` (uuid, primary key)
  - `message` (text) - error message
  - `stack` (text, nullable) - stack trace
  - `source` (text) - where the error was caught
  - `url` (text) - page URL at time of error
  - `user_agent` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Anonymous users can INSERT only (write-only from client)
  - No SELECT policy for anon — data is read-only via service role
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  source text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert error logs"
  ON error_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
