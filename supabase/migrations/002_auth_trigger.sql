-- CatStays: Auth trigger + RLS policy fixes
-- Run this in Supabase: Dashboard > SQL Editor > New Query

-- ============================================
-- 1. TRIGGER: Auto-create cattery on signup
-- ============================================
-- This runs server-side (SECURITY DEFINER) so it bypasses RLS,
-- ensuring a cattery record is always created when a user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  business TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  business := COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Cattery');
  base_slug := regexp_replace(lower(business), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- Handle duplicate slugs
  WHILE EXISTS (SELECT 1 FROM public.catteries WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.catteries (owner_id, name, slug, email)
  VALUES (
    NEW.id,
    business,
    final_slug,
    NEW.email
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if it exists, then create fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FIX RLS POLICIES: Separate INSERT policy
-- ============================================

DROP POLICY IF EXISTS "Owners manage cattery" ON catteries;
DROP POLICY IF EXISTS "Public can view cattery by slug" ON catteries;

-- Owner policies (separated so each operation is explicit)
CREATE POLICY "Owners can select cattery" ON catteries
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert cattery" ON catteries
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update cattery" ON catteries
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete cattery" ON catteries
  FOR DELETE USING (auth.uid() = owner_id);

-- Public read for tenant website pages (booking pages use cattery slug)
CREATE POLICY "Public can view cattery" ON catteries
  FOR SELECT USING (true);

-- ============================================
-- 3. BACKFILL: Fix any existing users without a cattery
-- ============================================
-- Run this if you already signed up and got the RLS error

INSERT INTO public.catteries (owner_id, name, slug, email)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'business_name', 'My Cattery'),
  COALESCE(
    trim(both '-' from regexp_replace(lower(COALESCE(u.raw_user_meta_data->>'business_name', 'my-cattery')), '[^a-z0-9]+', '-', 'g')),
    'my-cattery'
  ) || '-' || floor(random() * 9000 + 1000)::text,
  u.email
FROM auth.users u
LEFT JOIN public.catteries c ON c.owner_id = u.id
WHERE c.id IS NULL;
