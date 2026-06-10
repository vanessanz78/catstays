-- Migration 003: Custom domains + per-cattery payment settings
-- Run this in the Supabase SQL Editor

ALTER TABLE catteries
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{}';

-- Policy: only owners can update custom_domain / payment_settings (already covered by "Owners manage cattery")
-- Public cattery lookup by custom domain (extends existing public select policy)
-- No additional policy needed — the existing "Public can view cattery by slug" policy uses USING(true)
-- which allows all rows to be selected by any authenticated or anonymous user.

-- Optional: index for fast custom domain lookup
CREATE INDEX IF NOT EXISTS idx_catteries_custom_domain ON catteries(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_catteries_slug ON catteries(slug) WHERE slug IS NOT NULL;
