-- Extend seo_metadata for global site SEO (PantherWeb)
-- Use existing seo_metadata table: allow one row per owner with post_id AND page_id NULL = "site global" SEO.
-- Add analytics columns (google_analytics_id, facebook_pixel_id). Update constraint and RLS so public can read global row.

-- Allow global row: both post_id and page_id NULL
ALTER TABLE public.seo_metadata
  DROP CONSTRAINT IF EXISTS seo_metadata_exactly_one_target;

ALTER TABLE public.seo_metadata
  ADD CONSTRAINT seo_metadata_target_check CHECK (
    (post_id IS NOT NULL AND page_id IS NULL)
    OR (post_id IS NULL AND page_id IS NOT NULL)
    OR (post_id IS NULL AND page_id IS NULL)
  );

-- One global SEO row per owner
CREATE UNIQUE INDEX IF NOT EXISTS seo_metadata_global_owner_unique
  ON public.seo_metadata (owner_id)
  WHERE post_id IS NULL AND page_id IS NULL;

-- Analytics columns for global/site-level use
ALTER TABLE public.seo_metadata
  ADD COLUMN IF NOT EXISTS google_analytics_id TEXT,
  ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT;

-- Public: read global SEO row (no post/page) OR read SEO for published content
DROP POLICY IF EXISTS "seo_metadata_select_public" ON public.seo_metadata;
CREATE POLICY "seo_metadata_select_public"
ON public.seo_metadata
FOR SELECT
USING (
  (post_id IS NULL AND page_id IS NULL)
  OR
  (post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = seo_metadata.post_id AND p.is_published = TRUE
  ))
  OR
  (page_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.pages pg
    WHERE pg.id = seo_metadata.page_id AND pg.is_published = TRUE
  ))
);

COMMENT ON COLUMN public.seo_metadata.google_analytics_id IS 'Google Analytics ID (site/global use).';
COMMENT ON COLUMN public.seo_metadata.facebook_pixel_id IS 'Facebook Pixel ID (site/global use).';
COMMENT ON TABLE public.seo_metadata IS 'SEO metadata: per-page/post or global site (post_id and page_id both NULL).';
