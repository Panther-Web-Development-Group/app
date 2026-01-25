-- Tags & Categories schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Tags and categories for organizing posts/pages
-- - Many-to-many relationships via junction tables
-- - Public read, authors manage their own associations

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
-- Categories
-- =========================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Optional hex color for UI
  icon TEXT,

  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT categories_name_nonempty CHECK (length(btrim(name)) > 0),
  CONSTRAINT categories_slug_nonempty CHECK (length(btrim(slug)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON public.categories (slug);
CREATE INDEX IF NOT EXISTS categories_owner_idx ON public.categories (owner_id);
CREATE INDEX IF NOT EXISTS categories_order_idx ON public.categories (order_index);
CREATE INDEX IF NOT EXISTS categories_active_idx ON public.categories (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Tags
-- =========================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Optional hex color for UI
  icon TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tags_name_nonempty CHECK (length(btrim(name)) > 0),
  CONSTRAINT tags_slug_nonempty CHECK (length(btrim(slug)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_unique ON public.tags (slug);
CREATE INDEX IF NOT EXISTS tags_owner_idx ON public.tags (owner_id);
CREATE INDEX IF NOT EXISTS tags_active_idx ON public.tags (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_tags_updated_at ON public.tags;
CREATE TRIGGER set_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Post-Category associations
-- =========================
CREATE TABLE IF NOT EXISTS public.post_categories (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (post_id, category_id)
);

CREATE INDEX IF NOT EXISTS post_categories_post_idx ON public.post_categories (post_id);
CREATE INDEX IF NOT EXISTS post_categories_category_idx ON public.post_categories (category_id);

-- =========================
-- Post-Tag associations
-- =========================
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS post_tags_post_idx ON public.post_tags (post_id);
CREATE INDEX IF NOT EXISTS post_tags_tag_idx ON public.post_tags (tag_id);

-- =========================
-- Page-Category associations
-- =========================
CREATE TABLE IF NOT EXISTS public.page_categories (
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (page_id, category_id)
);

CREATE INDEX IF NOT EXISTS page_categories_page_idx ON public.page_categories (page_id);
CREATE INDEX IF NOT EXISTS page_categories_category_idx ON public.page_categories (category_id);

-- =========================
-- Page-Tag associations
-- =========================
CREATE TABLE IF NOT EXISTS public.page_tags (
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (page_id, tag_id)
);

CREATE INDEX IF NOT EXISTS page_tags_page_idx ON public.page_tags (page_id);
CREATE INDEX IF NOT EXISTS page_tags_tag_idx ON public.page_tags (tag_id);

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_tags ENABLE ROW LEVEL SECURITY;

-- Public: read only active categories/tags
DROP POLICY IF EXISTS "categories_select_active" ON public.categories;
CREATE POLICY "categories_select_active"
ON public.categories
FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "tags_select_active" ON public.tags;
CREATE POLICY "tags_select_active"
ON public.tags
FOR SELECT
USING (is_active = TRUE);

-- Owners manage their own categories/tags
DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
CREATE POLICY "categories_insert_own"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
CREATE POLICY "categories_update_own"
ON public.categories
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
CREATE POLICY "categories_delete_own"
ON public.categories
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "tags_insert_own" ON public.tags;
CREATE POLICY "tags_insert_own"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "tags_update_own" ON public.tags;
CREATE POLICY "tags_update_own"
ON public.tags
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "tags_delete_own" ON public.tags;
CREATE POLICY "tags_delete_own"
ON public.tags
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Associations: authors can manage associations for their own posts/pages
DROP POLICY IF EXISTS "post_categories_select_own" ON public.post_categories;
CREATE POLICY "post_categories_select_own"
ON public.post_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_categories.post_id
      AND (p.author_id = auth.uid() OR p.is_published = TRUE)
  )
);

DROP POLICY IF EXISTS "post_categories_insert_own" ON public.post_categories;
CREATE POLICY "post_categories_insert_own"
ON public.post_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_categories.post_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "post_categories_delete_own" ON public.post_categories;
CREATE POLICY "post_categories_delete_own"
ON public.post_categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_categories.post_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "post_tags_select_own" ON public.post_tags;
CREATE POLICY "post_tags_select_own"
ON public.post_tags
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_tags.post_id
      AND (p.author_id = auth.uid() OR p.is_published = TRUE)
  )
);

DROP POLICY IF EXISTS "post_tags_insert_own" ON public.post_tags;
CREATE POLICY "post_tags_insert_own"
ON public.post_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_tags.post_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "post_tags_delete_own" ON public.post_tags;
CREATE POLICY "post_tags_delete_own"
ON public.post_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    WHERE p.id = post_tags.post_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "page_categories_select_own" ON public.page_categories;
CREATE POLICY "page_categories_select_own"
ON public.page_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_categories.page_id
      AND (p.author_id = auth.uid() OR p.is_published = TRUE)
  )
);

DROP POLICY IF EXISTS "page_categories_insert_own" ON public.page_categories;
CREATE POLICY "page_categories_insert_own"
ON public.page_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_categories.page_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "page_categories_delete_own" ON public.page_categories;
CREATE POLICY "page_categories_delete_own"
ON public.page_categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_categories.page_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "page_tags_select_own" ON public.page_tags;
CREATE POLICY "page_tags_select_own"
ON public.page_tags
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_tags.page_id
      AND (p.author_id = auth.uid() OR p.is_published = TRUE)
  )
);

DROP POLICY IF EXISTS "page_tags_insert_own" ON public.page_tags;
CREATE POLICY "page_tags_insert_own"
ON public.page_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_tags.page_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "page_tags_delete_own" ON public.page_tags;
CREATE POLICY "page_tags_delete_own"
ON public.page_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = page_tags.page_id AND p.author_id = auth.uid()
  )
);

COMMENT ON TABLE public.categories IS 'Categories for organizing posts/pages.';
COMMENT ON TABLE public.tags IS 'Tags for organizing posts/pages.';
COMMENT ON TABLE public.post_categories IS 'Many-to-many: posts to categories.';
COMMENT ON TABLE public.post_tags IS 'Many-to-many: posts to tags.';
COMMENT ON TABLE public.page_categories IS 'Many-to-many: pages to categories.';
COMMENT ON TABLE public.page_tags IS 'Many-to-many: pages to tags.';
