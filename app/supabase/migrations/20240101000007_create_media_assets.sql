-- Media/Assets Management schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Centralized file management (images, videos, documents)
-- - Supabase Storage integration
-- - Metadata, alt text, dimensions
-- - Public read, owners manage their own

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File info
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL, -- Supabase Storage path or external URL
  file_url TEXT NOT NULL, -- Public URL
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes

  -- Media metadata
  alt_text TEXT,
  title TEXT,
  description TEXT,
  width INTEGER, -- pixels (for images/videos)
  height INTEGER, -- pixels (for images/videos)
  duration INTEGER, -- seconds (for videos/audio)

  -- Organization
  folder_path TEXT, -- Virtual folder organization
  tags TEXT[], -- Array of tags for quick filtering

  -- Type classification
  asset_type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video', 'audio', 'document', 'other'
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT media_assets_filename_nonempty CHECK (length(btrim(filename)) > 0),
  CONSTRAINT media_assets_file_path_nonempty CHECK (length(btrim(file_path)) > 0),
  CONSTRAINT media_assets_file_url_nonempty CHECK (length(btrim(file_url)) > 0),
  CONSTRAINT media_assets_mime_type_nonempty CHECK (length(btrim(mime_type)) > 0),
  CONSTRAINT media_assets_file_size_positive CHECK (file_size > 0),
  CONSTRAINT media_assets_type_valid CHECK (asset_type IN ('image', 'video', 'audio', 'document', 'other')),
  CONSTRAINT media_assets_dimensions_positive CHECK (
    (width IS NULL OR width > 0) AND
    (height IS NULL OR height > 0)
  ),
  CONSTRAINT media_assets_duration_positive CHECK (duration IS NULL OR duration > 0)
);

CREATE INDEX IF NOT EXISTS media_assets_owner_idx ON public.media_assets (owner_id);
CREATE INDEX IF NOT EXISTS media_assets_type_idx ON public.media_assets (asset_type);
CREATE INDEX IF NOT EXISTS media_assets_active_idx ON public.media_assets (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS media_assets_public_idx ON public.media_assets (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON public.media_assets (folder_path);
CREATE INDEX IF NOT EXISTS media_assets_tags_idx ON public.media_assets USING GIN (tags);
CREATE INDEX IF NOT EXISTS media_assets_created_idx ON public.media_assets (created_at DESC);

DROP TRIGGER IF EXISTS set_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER set_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Public: read only active + public assets
DROP POLICY IF EXISTS "media_assets_select_public" ON public.media_assets;
CREATE POLICY "media_assets_select_public"
ON public.media_assets
FOR SELECT
USING (is_active = TRUE AND is_public = TRUE);

-- Owners: can read all their own assets (including private ones)
DROP POLICY IF EXISTS "media_assets_select_own" ON public.media_assets;
CREATE POLICY "media_assets_select_own"
ON public.media_assets
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners: manage their own assets
DROP POLICY IF EXISTS "media_assets_insert_own" ON public.media_assets;
CREATE POLICY "media_assets_insert_own"
ON public.media_assets
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "media_assets_update_own" ON public.media_assets;
CREATE POLICY "media_assets_update_own"
ON public.media_assets
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "media_assets_delete_own" ON public.media_assets;
CREATE POLICY "media_assets_delete_own"
ON public.media_assets
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Convenience view: public media assets
CREATE OR REPLACE VIEW public.public_media_assets AS
SELECT
  id,
  filename,
  original_filename,
  file_url,
  mime_type,
  file_size,
  alt_text,
  title,
  description,
  width,
  height,
  duration,
  asset_type,
  folder_path,
  tags,
  metadata,
  created_at
FROM public.media_assets
WHERE is_active = TRUE AND is_public = TRUE;

COMMENT ON TABLE public.media_assets IS 'Centralized media/assets management with Supabase Storage integration.';
COMMENT ON VIEW public.public_media_assets IS 'Public-facing view of active, public media assets.';
