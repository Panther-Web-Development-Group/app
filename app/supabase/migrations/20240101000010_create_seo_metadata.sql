-- SEO Metadata schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Per-page/post SEO metadata
-- - Meta tags, Open Graph, Twitter Cards
-- - Public read, authors manage their own

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic target (exactly one)
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,

  -- Basic meta tags
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[], -- Array of keywords

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT, -- URL to OG image
  og_type TEXT DEFAULT 'website', -- 'website', 'article', etc.
  og_url TEXT,

  -- Twitter Card
  twitter_card TEXT DEFAULT 'summary_large_image', -- 'summary', 'summary_large_image', 'app', 'player'
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT, -- URL to Twitter image
  twitter_site TEXT, -- @username
  twitter_creator TEXT, -- @username

  -- Additional
  canonical_url TEXT,
  robots TEXT, -- e.g., 'noindex, nofollow'
  structured_data JSONB, -- JSON-LD structured data

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT seo_metadata_exactly_one_target CHECK (
    (post_id IS NOT NULL AND page_id IS NULL)
    OR
    (post_id IS NULL AND page_id IS NOT NULL)
  ),
  CONSTRAINT seo_metadata_og_type_valid CHECK (
    og_type IS NULL OR
    og_type IN ('website', 'article', 'book', 'profile', 'music', 'video', 'other')
  ),
  CONSTRAINT seo_metadata_twitter_card_valid CHECK (
    twitter_card IS NULL OR
    twitter_card IN ('summary', 'summary_large_image', 'app', 'player')
  ),
  CONSTRAINT seo_metadata_meta_title_len CHECK (meta_title IS NULL OR length(meta_title) <= 60),
  CONSTRAINT seo_metadata_meta_description_len CHECK (meta_description IS NULL OR length(meta_description) <= 160)
);

CREATE UNIQUE INDEX IF NOT EXISTS seo_metadata_post_unique ON public.seo_metadata (post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS seo_metadata_page_unique ON public.seo_metadata (page_id) WHERE page_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS seo_metadata_owner_idx ON public.seo_metadata (owner_id);
CREATE INDEX IF NOT EXISTS seo_metadata_post_idx ON public.seo_metadata (post_id);
CREATE INDEX IF NOT EXISTS seo_metadata_page_idx ON public.seo_metadata (page_id);

DROP TRIGGER IF EXISTS set_seo_metadata_updated_at ON public.seo_metadata;
CREATE TRIGGER set_seo_metadata_updated_at
BEFORE UPDATE ON public.seo_metadata
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

-- Public: read only SEO for published content
DROP POLICY IF EXISTS "seo_metadata_select_public" ON public.seo_metadata;
CREATE POLICY "seo_metadata_select_public"
ON public.seo_metadata
FOR SELECT
USING (
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

-- Authors: can read their own SEO (including for unpublished content)
DROP POLICY IF EXISTS "seo_metadata_select_own" ON public.seo_metadata;
CREATE POLICY "seo_metadata_select_own"
ON public.seo_metadata
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Authors: manage their own SEO
DROP POLICY IF EXISTS "seo_metadata_insert_own" ON public.seo_metadata;
CREATE POLICY "seo_metadata_insert_own"
ON public.seo_metadata
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "seo_metadata_update_own" ON public.seo_metadata;
CREATE POLICY "seo_metadata_update_own"
ON public.seo_metadata
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "seo_metadata_delete_own" ON public.seo_metadata;
CREATE POLICY "seo_metadata_delete_own"
ON public.seo_metadata
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Convenience view: SEO for published content
CREATE OR REPLACE VIEW public.published_seo_metadata AS
SELECT
  sm.id,
  sm.post_id,
  sm.page_id,
  sm.meta_title,
  sm.meta_description,
  sm.meta_keywords,
  sm.og_title,
  sm.og_description,
  sm.og_image,
  sm.og_type,
  sm.og_url,
  sm.twitter_card,
  sm.twitter_title,
  sm.twitter_description,
  sm.twitter_image,
  sm.twitter_site,
  sm.twitter_creator,
  sm.canonical_url,
  sm.robots,
  sm.structured_data
FROM public.seo_metadata sm
WHERE (
  (sm.post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = sm.post_id AND p.is_published = TRUE
  ))
  OR
  (sm.page_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.pages pg
    WHERE pg.id = sm.page_id AND pg.is_published = TRUE
  ))
);

COMMENT ON TABLE public.seo_metadata IS 'SEO metadata (meta tags, Open Graph, Twitter Cards) for posts/pages.';
COMMENT ON VIEW public.published_seo_metadata IS 'SEO metadata for published content only.';
