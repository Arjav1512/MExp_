/*
  # Fix mutable search_path on upsert_rate_limit_counter

  Sets SET search_path = '' on the function to prevent search_path injection attacks.
  All table references are qualified with the public schema explicitly.
*/

CREATE OR REPLACE FUNCTION public.upsert_rate_limit_counter(
  p_key          text,
  p_window_start timestamptz,
  p_max          integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.rate_limit_counters (key, count, window_start, updated_at)
  VALUES (p_key, 1, p_window_start, now())
  ON CONFLICT (key) DO UPDATE
    SET count        = CASE
                         WHEN public.rate_limit_counters.window_start < p_window_start
                         THEN 1
                         ELSE public.rate_limit_counters.count + 1
                       END,
        window_start = CASE
                         WHEN public.rate_limit_counters.window_start < p_window_start
                         THEN p_window_start
                         ELSE public.rate_limit_counters.window_start
                       END,
        updated_at   = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;
