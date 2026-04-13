/*
  # Create Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key) - Unique identifier for each subscriber
      - `email` (text, unique, not null) - Subscriber email address
      - `subscribed_at` (timestamptz, default now()) - Timestamp of subscription
      - `source` (text) - Source of subscription (e.g., 'homepage', 'footer')
      - `is_active` (boolean, default true) - Whether subscription is active
  
  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policy for INSERT operations (public can subscribe)
    - Add policy for SELECT operations (authenticated admin users only)
  
  3. Notes
    - Email validation should happen at application level
    - Duplicate emails are prevented by UNIQUE constraint
    - Soft delete approach using is_active flag
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'homepage',
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (INSERT)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users can view subscribers (for admin purposes later)
CREATE POLICY "Only authenticated users can view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create index on subscribed_at for sorting
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at DESC);