-- Migration 005: Align room records with dashboard availability fields
-- Run this in the Supabase SQL Editor after the initial CatStays migrations.

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

UPDATE rooms
SET capacity = COALESCE(capacity, max_cats, 1)
WHERE capacity IS NULL;
