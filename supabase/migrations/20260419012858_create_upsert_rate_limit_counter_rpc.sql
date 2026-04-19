/*
  # Create upsert_rate_limit_counter RPC

  ## Purpose
  Provides an atomic, concurrent-safe rate-limit counter upsert for the
  send-welcome-email edge function. Uses INSERT ... ON CONFLICT DO UPDATE so
  that simultaneous requests from different isolates cannot race past the limit.

  ## Behaviour
  - If no row exists for (key, window_start): insert with count = 1
  - If a row exists for (key, window_start): increment count by 1
  - If a row exists but its window_start is older than the supplied window_start:
    reset count to 1 and update window_start (new window has begun)
  - Returns the resulting count after the upsert

  The caller compares the returned count against its own max to decide whether
  the request is allowed. The function itself does not enforce a limit — it only
  tracks counts, keeping enforcement logic in the edge function.

  ## Parameters
  - p_key          text        — rate-limit bucket key (e.g. "ip:1.2.3.4")
  - p_window_start timestamptz — start of the current time window
  - p_max          integer     — (unused by SQL, present for call symmetry)

  ## Returns
  integer — the count after this request is recorded
*/

CREATE OR REPLACE FUNCTION upsert_rate_limit_counter(
  p_key          text,
  p_window_start timestamptz,
  p_max          integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limit_counters (key, count, window_start, updated_at)
  VALUES (p_key, 1, p_window_start, now())
  ON CONFLICT (key) DO UPDATE
    SET count        = CASE
                         WHEN rate_limit_counters.window_start < p_window_start
                         THEN 1
                         ELSE rate_limit_counters.count + 1
                       END,
        window_start = CASE
                         WHEN rate_limit_counters.window_start < p_window_start
                         THEN p_window_start
                         ELSE rate_limit_counters.window_start
                       END,
        updated_at   = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;
