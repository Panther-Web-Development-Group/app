-- Page Sections schema + RLS policies (“rules”)
-- Goal:
-- - Allow authors to build a page either as:
--   (A) a single `pages.content` JSONB document (whole page), OR
--   (B) multiple `page_sections` rows (sections) with full/partial widths.
-- - Public can read only published pages/sections.
-- - Authenticated users can create/update/delete only their own pages/sections.

-- =========================
-- Enums / Types
-- =========================
DO $$
BEGIN
  CREATE TYPE public.page_render_mode AS ENUM ('whole', 'sections');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.page_section_width AS ENUM ('full', 'partial');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- Pages: add render_mode
-- =========================
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS render_mode public.page_render_mode NOT NULL DEFAULT 'whole';

-- =========================
-- Page Sections
-- =========================
CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,

  -- Layout
  width public.page_section_width NOT NULL DEFAULT 'full',
  -- Optional 12-col grid span when width = 'partial'
  column_span INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT page_sections_width_span_check CHECK (
    (width = 'full' AND column_span IS NULL)
    OR
    (width = 'partial' AND column_span BETWEEN 1 AND 12)
  )
);

CREATE INDEX IF NOT EXISTS page_sections_page_idx ON public.page_sections (page_id);
CREATE INDEX IF NOT EXISTS page_sections_order_idx ON public.page_sections (page_id, order_index);

DROP TRIGGER IF EXISTS set_page_sections_updated_at ON public.page_sections;
CREATE TRIGGER set_page_sections_updated_at
BEFORE UPDATE ON public.page_sections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Publishing validation:
-- When publishing a page, ensure it has either:
-- - Whole-page content (non-empty JSONB), OR
-- - At least one section if render_mode = 'sections'
-- =========================
CREATE OR REPLACE FUNCTION public.validate_published_page_body()
RETURNS TRIGGER AS $$
DECLARE
  has_sections BOOLEAN;
BEGIN
  -- Only enforce when publishing
  IF NEW.is_published IS DISTINCT FROM TRUE THEN
    RETURN NEW;
  END IF;

  IF NEW.render_mode = 'sections' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.page_sections s
      WHERE s.page_id = NEW.id
      LIMIT 1
    ) INTO has_sections;

    IF NOT has_sections THEN
      RAISE EXCEPTION 'Cannot publish page % in sections mode without at least one section', NEW.id
        USING ERRCODE = 'check_violation';
    END IF;
  ELSE
    -- whole-page mode: require non-empty JSON
    IF COALESCE(NEW.content, '{}'::jsonb) = '{}'::jsonb THEN
      RAISE EXCEPTION 'Cannot publish page % in whole mode without content', NEW.id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_published_page_body ON public.pages;
CREATE TRIGGER validate_published_page_body
BEFORE INSERT OR UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.validate_published_page_body();

-- =========================
-- RLS policies
-- =========================
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Public can read sections only for published pages
DROP POLICY IF EXISTS "page_sections_select_published" ON public.page_sections;
CREATE POLICY "page_sections_select_published"
ON public.page_sections
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.is_published = TRUE
  )
);

-- Authors can read their own sections (drafts included)
DROP POLICY IF EXISTS "page_sections_select_own" ON public.page_sections;
CREATE POLICY "page_sections_select_own"
ON public.page_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.author_id = auth.uid()
  )
);

-- Authors can insert sections only for their own pages
DROP POLICY IF EXISTS "page_sections_insert_own" ON public.page_sections;
CREATE POLICY "page_sections_insert_own"
ON public.page_sections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.author_id = auth.uid()
  )
);

-- Authors can update their own sections
DROP POLICY IF EXISTS "page_sections_update_own" ON public.page_sections;
CREATE POLICY "page_sections_update_own"
ON public.page_sections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.author_id = auth.uid()
  )
);

-- Authors can delete their own sections
DROP POLICY IF EXISTS "page_sections_delete_own" ON public.page_sections;
CREATE POLICY "page_sections_delete_own"
ON public.page_sections
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.pages p
    WHERE p.id = page_id
      AND p.author_id = auth.uid()
  )
);

COMMENT ON TABLE public.page_sections IS 'Page sections used to build pages in sections mode (full/partial width) with Supabase RLS.';

