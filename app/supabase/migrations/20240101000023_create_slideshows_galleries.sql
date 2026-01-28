-- Slideshows + Galleries (media collections) schema + Supabase RLS policies (“rules”)
-- Notes:
-- - Uses public.media_assets as the canonical “media” table.
-- - Collections reference media_assets via ordered item tables.
-- - Idempotent: CREATE TABLE IF NOT EXISTS + DROP/CREATE policies.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Galleries
-- =========================
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT galleries_title_nonempty CHECK (length(btrim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS galleries_owner_idx ON public.galleries (owner_id);
CREATE INDEX IF NOT EXISTS galleries_active_idx ON public.galleries (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS galleries_public_idx ON public.galleries (is_public) WHERE is_public = TRUE;

DROP TRIGGER IF EXISTS set_galleries_updated_at ON public.galleries;
CREATE TRIGGER set_galleries_updated_at
BEFORE UPDATE ON public.galleries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,

  order_index INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  link_href TEXT,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT gallery_items_order_nonnegative CHECK (order_index >= 0),
  CONSTRAINT gallery_items_caption_nonempty CHECK (caption IS NULL OR length(btrim(caption)) > 0),
  CONSTRAINT gallery_items_link_href_nonempty CHECK (link_href IS NULL OR length(btrim(link_href)) > 0)
);

CREATE INDEX IF NOT EXISTS gallery_items_gallery_idx ON public.gallery_items (gallery_id);
CREATE INDEX IF NOT EXISTS gallery_items_gallery_order_idx ON public.gallery_items (gallery_id, order_index);
CREATE INDEX IF NOT EXISTS gallery_items_media_asset_idx ON public.gallery_items (media_asset_id);

DROP TRIGGER IF EXISTS set_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER set_gallery_items_updated_at
BEFORE UPDATE ON public.gallery_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Slideshows
-- =========================
CREATE TABLE IF NOT EXISTS public.slideshows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  autoplay BOOLEAN NOT NULL DEFAULT TRUE,
  autoplay_interval_ms INTEGER NOT NULL DEFAULT 5000,
  loop BOOLEAN NOT NULL DEFAULT TRUE,
  show_controls BOOLEAN NOT NULL DEFAULT TRUE,
  show_indicators BOOLEAN NOT NULL DEFAULT TRUE,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slideshows_title_nonempty CHECK (length(btrim(title)) > 0),
  CONSTRAINT slideshows_autoplay_interval_positive CHECK (autoplay_interval_ms > 0)
);

CREATE INDEX IF NOT EXISTS slideshows_owner_idx ON public.slideshows (owner_id);
CREATE INDEX IF NOT EXISTS slideshows_active_idx ON public.slideshows (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS slideshows_public_idx ON public.slideshows (is_public) WHERE is_public = TRUE;

DROP TRIGGER IF EXISTS set_slideshows_updated_at ON public.slideshows;
CREATE TRIGGER set_slideshows_updated_at
BEFORE UPDATE ON public.slideshows
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.slideshow_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slideshow_id UUID NOT NULL REFERENCES public.slideshows(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,

  order_index INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  link_href TEXT,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slideshow_slides_order_nonnegative CHECK (order_index >= 0),
  CONSTRAINT slideshow_slides_caption_nonempty CHECK (caption IS NULL OR length(btrim(caption)) > 0),
  CONSTRAINT slideshow_slides_link_href_nonempty CHECK (link_href IS NULL OR length(btrim(link_href)) > 0)
);

CREATE INDEX IF NOT EXISTS slideshow_slides_slideshow_idx ON public.slideshow_slides (slideshow_id);
CREATE INDEX IF NOT EXISTS slideshow_slides_slideshow_order_idx ON public.slideshow_slides (slideshow_id, order_index);
CREATE INDEX IF NOT EXISTS slideshow_slides_media_asset_idx ON public.slideshow_slides (media_asset_id);

DROP TRIGGER IF EXISTS set_slideshow_slides_updated_at ON public.slideshow_slides;
CREATE TRIGGER set_slideshow_slides_updated_at
BEFORE UPDATE ON public.slideshow_slides
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;

-- Galleries: public read only active + public
DROP POLICY IF EXISTS "galleries_select_public" ON public.galleries;
CREATE POLICY "galleries_select_public"
ON public.galleries
FOR SELECT
USING (is_active = TRUE AND is_public = TRUE);

-- Galleries: owners can read their own (including inactive/private)
DROP POLICY IF EXISTS "galleries_select_own" ON public.galleries;
CREATE POLICY "galleries_select_own"
ON public.galleries
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Galleries: owners manage their own
DROP POLICY IF EXISTS "galleries_insert_own" ON public.galleries;
CREATE POLICY "galleries_insert_own"
ON public.galleries
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "galleries_update_own" ON public.galleries;
CREATE POLICY "galleries_update_own"
ON public.galleries
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "galleries_delete_own" ON public.galleries;
CREATE POLICY "galleries_delete_own"
ON public.galleries
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Gallery items: public can read items only for public/active galleries AND public/active assets
DROP POLICY IF EXISTS "gallery_items_select_public" ON public.gallery_items;
CREATE POLICY "gallery_items_select_public"
ON public.gallery_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.is_active = TRUE
      AND g.is_public = TRUE
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.is_active = TRUE
      AND m.is_public = TRUE
  )
);

-- Gallery items: owners can read items for their own galleries
DROP POLICY IF EXISTS "gallery_items_select_own" ON public.gallery_items;
CREATE POLICY "gallery_items_select_own"
ON public.gallery_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.owner_id = auth.uid()
  )
);

-- Gallery items: owners manage items for their own galleries, and can only attach their own assets
DROP POLICY IF EXISTS "gallery_items_insert_own" ON public.gallery_items;
CREATE POLICY "gallery_items_insert_own"
ON public.gallery_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.owner_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "gallery_items_update_own" ON public.gallery_items;
CREATE POLICY "gallery_items_update_own"
ON public.gallery_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.owner_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "gallery_items_delete_own" ON public.gallery_items;
CREATE POLICY "gallery_items_delete_own"
ON public.gallery_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.galleries g
    WHERE g.id = gallery_id
      AND g.owner_id = auth.uid()
  )
);

-- Slideshows: public read only active + public
DROP POLICY IF EXISTS "slideshows_select_public" ON public.slideshows;
CREATE POLICY "slideshows_select_public"
ON public.slideshows
FOR SELECT
USING (is_active = TRUE AND is_public = TRUE);

-- Slideshows: owners can read their own (including inactive/private)
DROP POLICY IF EXISTS "slideshows_select_own" ON public.slideshows;
CREATE POLICY "slideshows_select_own"
ON public.slideshows
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Slideshows: owners manage their own
DROP POLICY IF EXISTS "slideshows_insert_own" ON public.slideshows;
CREATE POLICY "slideshows_insert_own"
ON public.slideshows
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "slideshows_update_own" ON public.slideshows;
CREATE POLICY "slideshows_update_own"
ON public.slideshows
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "slideshows_delete_own" ON public.slideshows;
CREATE POLICY "slideshows_delete_own"
ON public.slideshows
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Slideshow slides: public can read slides only for public/active slideshows AND public/active assets
DROP POLICY IF EXISTS "slideshow_slides_select_public" ON public.slideshow_slides;
CREATE POLICY "slideshow_slides_select_public"
ON public.slideshow_slides
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.is_active = TRUE
      AND s.is_public = TRUE
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.is_active = TRUE
      AND m.is_public = TRUE
  )
);

-- Slideshow slides: owners can read slides for their own slideshows
DROP POLICY IF EXISTS "slideshow_slides_select_own" ON public.slideshow_slides;
CREATE POLICY "slideshow_slides_select_own"
ON public.slideshow_slides
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.owner_id = auth.uid()
  )
);

-- Slideshow slides: owners manage slides for their own slideshows, and can only attach their own assets
DROP POLICY IF EXISTS "slideshow_slides_insert_own" ON public.slideshow_slides;
CREATE POLICY "slideshow_slides_insert_own"
ON public.slideshow_slides
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.owner_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "slideshow_slides_update_own" ON public.slideshow_slides;
CREATE POLICY "slideshow_slides_update_own"
ON public.slideshow_slides
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.owner_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1
    FROM public.media_assets m
    WHERE m.id = media_asset_id
      AND m.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "slideshow_slides_delete_own" ON public.slideshow_slides;
CREATE POLICY "slideshow_slides_delete_own"
ON public.slideshow_slides
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.slideshows s
    WHERE s.id = slideshow_id
      AND s.owner_id = auth.uid()
  )
);

COMMENT ON TABLE public.galleries IS 'Media gallery collections referencing media_assets (ordered items) with Supabase RLS.';
COMMENT ON TABLE public.gallery_items IS 'Ordered items within a gallery; each item references a media_asset.';
COMMENT ON TABLE public.slideshows IS 'Media slideshow collections referencing media_assets (ordered slides) with Supabase RLS.';
COMMENT ON TABLE public.slideshow_slides IS 'Ordered slides within a slideshow; each slide references a media_asset.';

