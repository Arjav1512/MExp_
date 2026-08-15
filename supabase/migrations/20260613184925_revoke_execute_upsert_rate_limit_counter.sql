-- Revoke direct REST API execution from unprivileged roles.
-- This function is only called server-side via the service role key.
REVOKE EXECUTE ON FUNCTION public.upsert_rate_limit_counter(text, timestamptz, integer) FROM anon, authenticated;
