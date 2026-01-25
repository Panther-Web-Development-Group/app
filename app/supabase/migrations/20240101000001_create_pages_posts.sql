-- Pages + Posts schema with Supabase-friendly RLS policies (“rules”)
-- Assumptions:
-- - Uses Supabase Auth; authors are tracked by `author_id = auth.uid()`
-- - Public can read only published content
-- - Authenticated users can create/update/delete only their own content

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Pages
-- =========================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,

  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pages_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT pages_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_unique ON public.pages (slug);
CREATE INDEX IF NOT EXISTS pages_published_idx ON public.pages (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS pages_author_idx ON public.pages (author_id);

DROP TRIGGER IF EXISTS set_pages_updated_at ON public.pages;
CREATE TRIGGER set_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Posts
-- =========================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,

  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  featured_image TEXT,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT posts_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON public.posts (slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts (author_id);

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Row Level Security (RLS) policies
-- =========================
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Pages: public read only published
DROP POLICY IF EXISTS "pages_select_published" ON public.pages;
CREATE POLICY "pages_select_published"
ON public.pages
FOR SELECT
USING (is_published = TRUE);

-- Pages: authors manage their own
DROP POLICY IF EXISTS "pages_insert_own" ON public.pages;
CREATE POLICY "pages_insert_own"
ON public.pages
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "pages_update_own" ON public.pages;
CREATE POLICY "pages_update_own"
ON public.pages
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "pages_delete_own" ON public.pages;
CREATE POLICY "pages_delete_own"
ON public.pages
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- Posts: public read only published
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;
CREATE POLICY "posts_select_published"
ON public.posts
FOR SELECT
USING (is_published = TRUE);

-- Posts: authors manage their own
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own"
ON public.posts
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own"
ON public.posts
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

COMMENT ON TABLE public.pages IS 'CMS pages (draft/published) with Supabase RLS policies.';
COMMENT ON TABLE public.posts IS 'CMS posts (draft/published) with Supabase RLS policies.';
