-- Migration 006: Catalog imported website content for AI-assisted previews.
-- Run this in the Supabase SQL Editor or through the normal migration pipeline.

CREATE TABLE IF NOT EXISTS preview_source_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattery_id UUID REFERENCES catteries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_url TEXT NOT NULL,
  source_host TEXT,
  source_fingerprint TEXT GENERATED ALWAYS AS (md5(lower(btrim(source_url)))) STORED,
  business_name TEXT,
  import_status TEXT DEFAULT 'indexed',
  template_hint TEXT,
  content_hash TEXT,
  raw_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_fingerprint, created_by)
);

CREATE TABLE IF NOT EXISTS preview_source_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES preview_source_imports(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT GENERATED ALWAYS AS (lower(split_part(url, '?', 1))) STORED,
  source_page_url TEXT,
  source_page_title TEXT,
  alt_text TEXT,
  title TEXT,
  caption TEXT,
  nearby_text TEXT,
  semantic_role TEXT DEFAULT 'unknown',
  section_hint TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  contains_text BOOLEAN DEFAULT false,
  text_density NUMERIC(5,4),
  is_logo BOOLEAN DEFAULT false,
  is_decorative BOOLEAN DEFAULT false,
  quality_score NUMERIC(5,4),
  ai_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (import_id, normalized_url)
);

CREATE TABLE IF NOT EXISTS preview_source_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES preview_source_imports(id) ON DELETE CASCADE NOT NULL,
  source_page_url TEXT,
  source_page_title TEXT,
  heading TEXT,
  title TEXT,
  body TEXT,
  semantic_role TEXT DEFAULT 'general',
  section_hint TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  intent JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preview_source_content_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES preview_source_imports(id) ON DELETE CASCADE NOT NULL,
  content_item_id UUID REFERENCES preview_source_content_items(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES preview_source_media_assets(id) ON DELETE CASCADE,
  semantic_role TEXT DEFAULT 'related',
  confidence NUMERIC(5,4) DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (content_item_id IS NOT NULL OR media_asset_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS preview_template_slot_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES preview_source_imports(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  content_item_id UUID REFERENCES preview_source_content_items(id) ON DELETE SET NULL,
  media_asset_id UUID REFERENCES preview_source_media_assets(id) ON DELETE SET NULL,
  confidence NUMERIC(5,4) DEFAULT 0,
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (import_id, template_id, slot_key)
);

CREATE INDEX IF NOT EXISTS preview_source_imports_cattery_idx
  ON preview_source_imports(cattery_id);

CREATE INDEX IF NOT EXISTS preview_source_imports_created_by_idx
  ON preview_source_imports(created_by);

CREATE INDEX IF NOT EXISTS preview_source_media_assets_import_role_idx
  ON preview_source_media_assets(import_id, semantic_role);

CREATE INDEX IF NOT EXISTS preview_source_media_assets_tags_idx
  ON preview_source_media_assets USING gin(tags);

CREATE INDEX IF NOT EXISTS preview_source_content_items_import_role_idx
  ON preview_source_content_items(import_id, semantic_role);

CREATE INDEX IF NOT EXISTS preview_source_content_items_tags_idx
  ON preview_source_content_items USING gin(tags);

CREATE INDEX IF NOT EXISTS preview_source_content_media_links_import_idx
  ON preview_source_content_media_links(import_id);

CREATE INDEX IF NOT EXISTS preview_template_slot_assignments_import_template_idx
  ON preview_template_slot_assignments(import_id, template_id);

ALTER TABLE preview_source_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_source_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_source_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_source_content_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_template_slot_assignments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON preview_source_imports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON preview_source_media_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON preview_source_content_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON preview_source_content_media_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON preview_template_slot_assignments TO authenticated;

DROP POLICY IF EXISTS "Users manage their preview source imports" ON preview_source_imports;
CREATE POLICY "Users manage their preview source imports"
  ON preview_source_imports
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users manage media for their preview imports" ON preview_source_media_assets;
CREATE POLICY "Users manage media for their preview imports"
  ON preview_source_media_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_media_assets.import_id
        AND imports.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_media_assets.import_id
        AND imports.created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users manage content for their preview imports" ON preview_source_content_items;
CREATE POLICY "Users manage content for their preview imports"
  ON preview_source_content_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_content_items.import_id
        AND imports.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_content_items.import_id
        AND imports.created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users manage media links for their preview imports" ON preview_source_content_media_links;
CREATE POLICY "Users manage media links for their preview imports"
  ON preview_source_content_media_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_content_media_links.import_id
        AND imports.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_source_content_media_links.import_id
        AND imports.created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users manage template slots for their preview imports" ON preview_template_slot_assignments;
CREATE POLICY "Users manage template slots for their preview imports"
  ON preview_template_slot_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_template_slot_assignments.import_id
        AND imports.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM preview_source_imports imports
      WHERE imports.id = preview_template_slot_assignments.import_id
        AND imports.created_by = (select auth.uid())
    )
  );

DROP TRIGGER IF EXISTS preview_source_imports_updated_at ON preview_source_imports;
CREATE TRIGGER preview_source_imports_updated_at
  BEFORE UPDATE ON preview_source_imports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
