-- Migration 007: Open Home Content Platform security and performance hardening
-- Phase 1.5 only: permissions, RLS policies, lifecycle enums, and operational indexes.
-- No application logic, preview generation, renderer, or Local Storage behaviour is introduced here.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'open_home_content_source_type') THEN
    CREATE TYPE open_home_content_source_type AS ENUM (
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
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'open_home_content_source_status') THEN
    CREATE TYPE open_home_content_source_status AS ENUM (
      'pending',
      'importing',
      'ready',
      'failed',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'open_home_website_draft_status') THEN
    CREATE TYPE open_home_website_draft_status AS ENUM (
      'draft',
      'active',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'open_home_website_preview_status') THEN
    CREATE TYPE open_home_website_preview_status AS ENUM (
      'generating',
      'ready',
      'verified',
      'approved',
      'published',
      'archived',
      'failed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'open_home_assignment_type') THEN
    CREATE TYPE open_home_assignment_type AS ENUM (
      'content',
      'media',
      'mixed'
    );
  END IF;
END
$$;

ALTER TABLE content_sources
  ALTER COLUMN source_type DROP DEFAULT,
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE website_drafts
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE website_previews
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE content_sources
  DROP CONSTRAINT IF EXISTS content_sources_source_type_check,
  DROP CONSTRAINT IF EXISTS content_sources_status_check,
  ALTER COLUMN source_type TYPE open_home_content_source_type
    USING source_type::open_home_content_source_type,
  ALTER COLUMN status TYPE open_home_content_source_status
    USING status::open_home_content_source_status,
  ALTER COLUMN status SET DEFAULT 'pending'::open_home_content_source_status;

ALTER TABLE website_drafts
  DROP CONSTRAINT IF EXISTS website_drafts_status_check,
  ALTER COLUMN status TYPE open_home_website_draft_status
    USING status::open_home_website_draft_status,
  ALTER COLUMN status SET DEFAULT 'draft'::open_home_website_draft_status;

ALTER TABLE website_previews
  DROP CONSTRAINT IF EXISTS website_previews_status_check,
  ALTER COLUMN status TYPE open_home_website_preview_status
    USING status::open_home_website_preview_status,
  ALTER COLUMN status SET DEFAULT 'generating'::open_home_website_preview_status;

ALTER TABLE assignments
  DROP CONSTRAINT IF EXISTS assignments_type_check,
  ALTER COLUMN assignment_type TYPE open_home_assignment_type
    USING assignment_type::open_home_assignment_type;

CREATE OR REPLACE FUNCTION public.open_home_is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'platform_admin'), false)
    OR COALESCE((auth.jwt() -> 'app_metadata' -> 'roles') ? 'admin', false)
    OR COALESCE((auth.jwt() -> 'app_metadata' -> 'roles') ? 'platform_admin', false);
$$;

CREATE OR REPLACE FUNCTION public.open_home_can_manage_cattery(target_cattery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    public.open_home_is_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.catteries
      WHERE public.catteries.id = target_cattery_id
        AND public.catteries.owner_id = (SELECT auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION public.open_home_is_platform_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.open_home_can_manage_cattery(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_home_is_platform_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.open_home_can_manage_cattery(uuid) TO anon, authenticated, service_role;

REVOKE ALL ON TABLE
  content_sources,
  media_library,
  content_library,
  website_drafts,
  assignments,
  website_previews,
  website_published_versions,
  website_events
FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  content_sources,
  media_library,
  content_library,
  website_drafts,
  assignments,
  website_previews
TO authenticated;

GRANT SELECT, INSERT ON TABLE website_events TO authenticated;
GRANT SELECT ON TABLE website_published_versions TO anon, authenticated;

GRANT ALL ON TABLE
  content_sources,
  media_library,
  content_library,
  website_drafts,
  assignments,
  website_previews,
  website_published_versions,
  website_events
TO service_role;

DROP POLICY IF EXISTS "Owners and admins manage content sources" ON content_sources;
CREATE POLICY "Owners and admins manage content sources"
ON content_sources
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins manage media library" ON media_library;
CREATE POLICY "Owners and admins manage media library"
ON media_library
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins manage content library" ON content_library;
CREATE POLICY "Owners and admins manage content library"
ON content_library
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins manage website drafts" ON website_drafts;
CREATE POLICY "Owners and admins manage website drafts"
ON website_drafts
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins manage assignments" ON assignments;
CREATE POLICY "Owners and admins manage assignments"
ON assignments
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins manage website previews" ON website_previews;
CREATE POLICY "Owners and admins manage website previews"
ON website_previews
FOR ALL
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id))
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins read published versions" ON website_published_versions;
CREATE POLICY "Owners and admins read published versions"
ON website_published_versions
FOR SELECT
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Public reads current published versions" ON website_published_versions;
CREATE POLICY "Public reads current published versions"
ON website_published_versions
FOR SELECT
TO anon
USING (
  archived_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM catteries
    WHERE catteries.id = website_published_versions.cattery_id
      AND catteries.current_published_version_id = website_published_versions.id
  )
);

DROP POLICY IF EXISTS "Owners and admins read website events" ON website_events;
CREATE POLICY "Owners and admins read website events"
ON website_events
FOR SELECT
TO authenticated
USING (public.open_home_can_manage_cattery(cattery_id));

DROP POLICY IF EXISTS "Owners and admins append website events" ON website_events;
CREATE POLICY "Owners and admins append website events"
ON website_events
FOR INSERT
TO authenticated
WITH CHECK (public.open_home_can_manage_cattery(cattery_id));

CREATE INDEX IF NOT EXISTS idx_catteries_current_source_id ON catteries(current_source_id);
CREATE INDEX IF NOT EXISTS idx_catteries_current_draft_id ON catteries(current_draft_id);
CREATE INDEX IF NOT EXISTS idx_catteries_current_preview_id ON catteries(current_preview_id);
CREATE INDEX IF NOT EXISTS idx_catteries_current_published_version_id ON catteries(current_published_version_id);

CREATE INDEX IF NOT EXISTS idx_content_sources_created_by ON content_sources(created_by);

CREATE INDEX IF NOT EXISTS idx_media_library_cattery_category_confidence
  ON media_library(cattery_id, category, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_content_library_cattery_type_key
  ON content_library(cattery_id, content_type, content_key);

CREATE INDEX IF NOT EXISTS idx_website_drafts_cattery_status_updated
  ON website_drafts(cattery_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_drafts_created_by ON website_drafts(created_by);

CREATE INDEX IF NOT EXISTS idx_website_previews_draft_status_created
  ON website_previews(draft_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_previews_cattery_status_created
  ON website_previews(cattery_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_previews_created_by ON website_previews(created_by);

CREATE INDEX IF NOT EXISTS idx_assignments_draft_section_role_sort
  ON assignments(draft_id, section_key, assignment_role, sort_order);
CREATE INDEX IF NOT EXISTS idx_assignments_preview_section_role_sort
  ON assignments(preview_id, section_key, assignment_role, sort_order);

CREATE INDEX IF NOT EXISTS idx_website_published_versions_current
  ON website_published_versions(cattery_id, published_at DESC)
  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_website_published_versions_published_by
  ON website_published_versions(published_by);

CREATE INDEX IF NOT EXISTS idx_website_events_source_id ON website_events(source_id);
CREATE INDEX IF NOT EXISTS idx_website_events_media_id ON website_events(media_id);
CREATE INDEX IF NOT EXISTS idx_website_events_content_id ON website_events(content_id);
CREATE INDEX IF NOT EXISTS idx_website_events_draft_id ON website_events(draft_id);
CREATE INDEX IF NOT EXISTS idx_website_events_assignment_id ON website_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_website_events_preview_id ON website_events(preview_id);
CREATE INDEX IF NOT EXISTS idx_website_events_published_version_id ON website_events(published_version_id);
CREATE INDEX IF NOT EXISTS idx_website_events_actor_id ON website_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_website_events_cattery_created
  ON website_events(cattery_id, created_at DESC);
