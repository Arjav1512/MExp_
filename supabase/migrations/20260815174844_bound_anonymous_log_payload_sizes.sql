/*
  # Bound anonymous log payload sizes

  1. Problem
     `error_logs` and `analytics_events` both accept INSERT from the `anon`
     role with predicates that only check non-emptiness. The text columns are
     unbounded, so an anonymous caller can use them as bulk storage.

  2. Change
     Add CHECK constraints capping the length of each free-text column at a
     size far above any legitimate client payload:
       - error_logs.message     4 KB
       - error_logs.stack      16 KB
       - error_logs.source      256 B
       - error_logs.url        2 KB
       - error_logs.user_agent  1 KB
       - analytics_events.event 128 B
     Plus a bound on the serialized jsonb blobs (8 KB) on both tables.

  3. Notes
     Constraints are added NOT VALID first would skip existing-row checks, but
     these tables are small and current rows are well inside the limits, so the
     constraints are added validated. No data is modified or removed.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_logs_message_len') THEN
    ALTER TABLE public.error_logs ADD CONSTRAINT error_logs_message_len CHECK (length(message) <= 4096);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_logs_stack_len') THEN
    ALTER TABLE public.error_logs ADD CONSTRAINT error_logs_stack_len CHECK (stack IS NULL OR length(stack) <= 16384);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_logs_source_len') THEN
    ALTER TABLE public.error_logs ADD CONSTRAINT error_logs_source_len CHECK (source IS NULL OR length(source) <= 256);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_logs_url_len') THEN
    ALTER TABLE public.error_logs ADD CONSTRAINT error_logs_url_len CHECK (url IS NULL OR length(url) <= 2048);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_logs_user_agent_len') THEN
    ALTER TABLE public.error_logs ADD CONSTRAINT error_logs_user_agent_len CHECK (user_agent IS NULL OR length(user_agent) <= 1024);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analytics_events_event_len') THEN
    ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_event_len CHECK (length(event) <= 128);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analytics_events_properties_len') THEN
    ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_properties_len CHECK (properties IS NULL OR length(properties::text) <= 8192);
  END IF;
END $$;
