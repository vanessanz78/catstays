-- Migration 006: Open Home Content Platform schema foundation
-- Phase 1 only: tables, lineage relationships, constraints, indexes, and RLS enabled.
-- Phase 2 will add explicit RLS policies and grants.

CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT,
  import_version TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_sources_status_check CHECK (
    status IN ('pending', 'importing', 'ready', 'failed', 'archived')
  ),
  CONSTRAINT content_sources_source_type_check CHECK (
    source_type IN (
      'website',
      'google_business',
      'facebook',
      'instagram',
      'booking_com',
      'uploaded_image',
      'pdf',
      'manual',
      'ai_generated',
      'other'
    )
  )
);

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  original_url TEXT,
  storage_url TEXT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  category TEXT,
  confidence NUMERIC(5,4),
  alt_text TEXT,
  contains_text BOOLEAN NOT NULL DEFAULT false,
  is_logo BOOLEAN NOT NULL DEFAULT false,
  is_open_graph BOOLEAN NOT NULL DEFAULT false,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  is_building BOOLEAN NOT NULL DEFAULT false,
  is_suite BOOLEAN NOT NULL DEFAULT false,
  is_gallery BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT media_library_confidence_check CHECK (
    confidence IS NULL OR (confidence >= 0 AND confidence <= 1)
  )
);

CREATE TABLE IF NOT EXISTS content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_key TEXT,
  title TEXT,
  body TEXT,
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(5,4),
  language TEXT,
  source_label TEXT,
  extraction_version TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_library_confidence_check CHECK (
    confidence IS NULL OR (confidence >= 0 AND confidence <= 1)
  )
);

CREATE TABLE IF NOT EXISTS website_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_template TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT website_drafts_status_check CHECK (
    status IN ('draft', 'active', 'archived')
  )
);

CREATE TABLE IF NOT EXISTS website_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  draft_id UUID NOT NULL REFERENCES website_drafts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating',
  preview_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  verification_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_hash TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  CONSTRAINT website_previews_status_check CHECK (
    status IN ('generating', 'ready', 'verified', 'approved', 'published', 'archived', 'failed')
  ),
  CONSTRAINT website_previews_version_check CHECK (version > 0),
  CONSTRAINT website_previews_draft_version_unique UNIQUE (draft_id, version)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  draft_id UUID NOT NULL REFERENCES website_drafts(id) ON DELETE CASCADE,
  preview_id UUID REFERENCES website_previews(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_library(id) ON DELETE SET NULL,
  media_id UUID REFERENCES media_library(id) ON DELETE SET NULL,
  assignment_type TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_label TEXT,
  assignment_role TEXT,
  confidence NUMERIC(5,4),
  reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  assigned_by TEXT NOT NULL DEFAULT 'assignment_engine',
  assignment_version INTEGER NOT NULL DEFAULT 1,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT assignments_type_check CHECK (
    assignment_type IN ('content', 'media', 'mixed')
  ),
  CONSTRAINT assignments_confidence_check CHECK (
    confidence IS NULL OR (confidence >= 0 AND confidence <= 1)
  ),
  CONSTRAINT assignments_version_check CHECK (assignment_version > 0),
  CONSTRAINT assignments_content_or_media_check CHECK (
    content_id IS NOT NULL OR media_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS website_published_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  preview_id UUID NOT NULL REFERENCES website_previews(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL,
  published_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  CONSTRAINT website_published_versions_version_check CHECK (version > 0),
  CONSTRAINT website_published_versions_cattery_version_unique UNIQUE (cattery_id, version)
);

CREATE TABLE IF NOT EXISTS website_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID NOT NULL REFERENCES catteries(id) ON DELETE CASCADE,
  source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  media_id UUID REFERENCES media_library(id) ON DELETE SET NULL,
  content_id UUID REFERENCES content_library(id) ON DELETE SET NULL,
  draft_id UUID REFERENCES website_drafts(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  preview_id UUID REFERENCES website_previews(id) ON DELETE SET NULL,
  published_version_id UUID REFERENCES website_published_versions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE catteries
  ADD COLUMN IF NOT EXISTS current_source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_draft_id UUID REFERENCES website_drafts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_preview_id UUID REFERENCES website_previews(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_published_version_id UUID REFERENCES website_published_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_content_sources_cattery_id ON content_sources(cattery_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_status ON content_sources(status);
CREATE INDEX IF NOT EXISTS idx_content_sources_type ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_content_sources_hash ON content_sources(content_hash);

CREATE INDEX IF NOT EXISTS idx_media_library_cattery_id ON media_library(cattery_id);
CREATE INDEX IF NOT EXISTS idx_media_library_source_id ON media_library(source_id);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_storage_url ON media_library(storage_url);

CREATE INDEX IF NOT EXISTS idx_content_library_cattery_id ON content_library(cattery_id);
CREATE INDEX IF NOT EXISTS idx_content_library_source_id ON content_library(source_id);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON content_library(content_type);
CREATE INDEX IF NOT EXISTS idx_content_library_key ON content_library(content_key);

CREATE INDEX IF NOT EXISTS idx_website_drafts_cattery_id ON website_drafts(cattery_id);
CREATE INDEX IF NOT EXISTS idx_website_drafts_source_id ON website_drafts(source_id);
CREATE INDEX IF NOT EXISTS idx_website_drafts_status ON website_drafts(status);

CREATE INDEX IF NOT EXISTS idx_website_previews_cattery_id ON website_previews(cattery_id);
CREATE INDEX IF NOT EXISTS idx_website_previews_draft_id ON website_previews(draft_id);
CREATE INDEX IF NOT EXISTS idx_website_previews_status ON website_previews(status);
CREATE INDEX IF NOT EXISTS idx_website_previews_hash ON website_previews(preview_hash);

CREATE INDEX IF NOT EXISTS idx_assignments_cattery_id ON assignments(cattery_id);
CREATE INDEX IF NOT EXISTS idx_assignments_draft_id ON assignments(draft_id);
CREATE INDEX IF NOT EXISTS idx_assignments_preview_id ON assignments(preview_id);
CREATE INDEX IF NOT EXISTS idx_assignments_content_id ON assignments(content_id);
CREATE INDEX IF NOT EXISTS idx_assignments_media_id ON assignments(media_id);
CREATE INDEX IF NOT EXISTS idx_assignments_section ON assignments(section_key, assignment_role);

CREATE INDEX IF NOT EXISTS idx_website_published_versions_cattery_id ON website_published_versions(cattery_id);
CREATE INDEX IF NOT EXISTS idx_website_published_versions_preview_id ON website_published_versions(preview_id);

CREATE INDEX IF NOT EXISTS idx_website_events_cattery_id ON website_events(cattery_id);
CREATE INDEX IF NOT EXISTS idx_website_events_type ON website_events(event_type);
CREATE INDEX IF NOT EXISTS idx_website_events_created_at ON website_events(created_at);

ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_events ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS content_sources_updated_at ON content_sources;
CREATE TRIGGER content_sources_updated_at BEFORE UPDATE ON content_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS media_library_updated_at ON media_library;
CREATE TRIGGER media_library_updated_at BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS content_library_updated_at ON content_library;
CREATE TRIGGER content_library_updated_at BEFORE UPDATE ON content_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS website_drafts_updated_at ON website_drafts;
CREATE TRIGGER website_drafts_updated_at BEFORE UPDATE ON website_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
