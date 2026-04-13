/*
  # Fix Newsletter Subscribers RLS SELECT Policy

  ## Problem
  The existing SELECT policy used USING (true) scoped to the 'authenticated' role,
  meaning any authenticated Supabase user could read all subscriber email addresses —
  a full PII data breach vector.

  ## Changes
  - Drop the insecure "Only authenticated users can view subscribers" SELECT policy
  - No replacement SELECT policy is added for regular users
  - Subscriber data is now only accessible via the service role key (server-side admin use)
    which bypasses RLS entirely, as intended for admin operations

  ## Security Impact
  - Anonymous users: cannot read subscribers (unchanged)
  - Authenticated users: can no longer read subscribers (fixed)
  - Service role: can still read all subscribers for admin/reporting purposes
*/

DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON newsletter_subscribers;
