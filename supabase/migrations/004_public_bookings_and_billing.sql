-- Migration 004: Public booking inserts + Stripe subscription fields
-- Run this in the Supabase SQL Editor

-- 1. Guest fields on bookings (for public booking requests without accounts)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS cat_names TEXT,
  ADD COLUMN IF NOT EXISTS number_of_cats INTEGER DEFAULT 1;

-- 2. Allow public (anonymous) inserts for booking requests
--    Only allows status = 'pending' so owners can't be spammed with confirmed bookings
DROP POLICY IF EXISTS "Public can create pending bookings" ON bookings;
CREATE POLICY "Public can create pending bookings" ON bookings
  FOR INSERT WITH CHECK (status = 'pending');

-- 3. Stripe billing fields on catteries
ALTER TABLE catteries
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
