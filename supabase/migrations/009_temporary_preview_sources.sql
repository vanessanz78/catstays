-- Migration 009: Temporary website preview imports
-- Anonymous website previews need durable scrape evidence before an account exists.
-- These rows are service-managed by the API, token-addressed, and adopted into
-- cattery-owned content_sources when the visitor creates an account.

CREATE TABLE IF NOT EXISTS temporary_preview_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_token_hash TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  source_host TEXT,
  source_name TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  asset_manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT,
  import_version TEXT,
  selected_template TEXT DEFAULT 'original',
  status TEXT NOT NULL DEFAULT 'active',
  schema_version INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  adopted_cattery_id UUID REFERENCES catteries(id) ON DELETE SET NULL,
  adopted_source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  adopted_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT temporary_preview_sources_status_check CHECK (
    status IN ('active', 'adopted', 'abandoned', 'expired', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_temporary_preview_sources_status_expires
  ON temporary_preview_sources(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_temporary_preview_sources_source_url
  ON temporary_preview_sources(source_url);

CREATE INDEX IF NOT EXISTS idx_temporary_preview_sources_adopted_cattery_id
  ON temporary_preview_sources(adopted_cattery_id);

ALTER TABLE temporary_preview_sources ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE temporary_preview_sources FROM anon, authenticated;
GRANT ALL ON TABLE temporary_preview_sources TO service_role;

DROP TRIGGER IF EXISTS temporary_preview_sources_updated_at ON temporary_preview_sources;
CREATE TRIGGER temporary_preview_sources_updated_at BEFORE UPDATE ON temporary_preview_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
