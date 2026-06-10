-- CatStays Initial Schema
-- Run this in your Supabase project: Dashboard > SQL Editor > New Query

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS catteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'NZ',
  logo_url TEXT,
  website_settings JSONB DEFAULT '{}',
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'standard',
  description TEXT,
  price_per_night DECIMAL(10,2) DEFAULT 0,
  max_cats INTEGER DEFAULT 1,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  age TEXT,
  photo_url TEXT,
  medical_notes TEXT,
  dietary_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  room_id UUID REFERENCES rooms(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'unpaid',
  total_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  cat_id UUID REFERENCES cats(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'booking',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE catteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Catteries
CREATE POLICY "Owners manage cattery" ON catteries
  FOR ALL USING (auth.uid() = owner_id);

-- Rooms
CREATE POLICY "Owners manage rooms" ON rooms
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- Customers
CREATE POLICY "Owners manage customers" ON customers
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- Cats
CREATE POLICY "Owners manage cats" ON cats
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- Bookings
CREATE POLICY "Owners manage bookings" ON bookings
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- Booking cats
CREATE POLICY "Owners manage booking_cats" ON booking_cats
  FOR ALL USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN catteries c ON b.cattery_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Payments
CREATE POLICY "Owners manage payments" ON payments
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- Expenses
CREATE POLICY "Owners manage expenses" ON expenses
  FOR ALL USING (
    cattery_id IN (SELECT id FROM catteries WHERE owner_id = auth.uid())
  );

-- ============================================
-- PUBLIC READ POLICIES (for tenant booking pages)
-- ============================================

CREATE POLICY "Public can view cattery by slug" ON catteries
  FOR SELECT USING (true);

CREATE POLICY "Public can view active rooms" ON rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view bookings for availability" ON bookings
  FOR SELECT USING (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catteries_updated_at BEFORE UPDATE ON catteries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
