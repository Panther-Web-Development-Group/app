-- Footer navigation + social links schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Footer sections (e.g., "Resources", "Company")
-- - Footer links within sections (supports nested links via parent_link_id)
-- - Social links (e.g., Instagram/GitHub) with icon + optional image
-- - Public read only active items
-- - Authenticated users manage only their own footer config

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
-- Footer sections
-- =========================
CREATE TABLE IF NOT EXISTS public.footer_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT footer_sections_title_nonempty CHECK (length(btrim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS footer_sections_owner_idx ON public.footer_sections (owner_id);
CREATE INDEX IF NOT EXISTS footer_sections_order_idx ON public.footer_sections (order_index);
CREATE INDEX IF NOT EXISTS footer_sections_active_idx ON public.footer_sections (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_footer_sections_updated_at ON public.footer_sections;
CREATE TRIGGER set_footer_sections_updated_at
BEFORE UPDATE ON public.footer_sections
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Footer links (supports sub-links)
-- =========================
CREATE TABLE IF NOT EXISTS public.footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  section_id UUID REFERENCES public.footer_sections(id) ON DELETE CASCADE,
  parent_link_id UUID REFERENCES public.footer_links(id) ON DELETE CASCADE,

  label TEXT NOT NULL,
  href TEXT,
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  target TEXT NOT NULL DEFAULT '_self',
  icon TEXT,
  image TEXT, -- URL/path (optional)

  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT footer_links_label_nonempty CHECK (length(btrim(label)) > 0),
  CONSTRAINT footer_links_no_self_parent CHECK (id <> parent_link_id),
  -- Must belong to a section OR be a child link; top-level links should have section_id
  CONSTRAINT footer_links_section_or_parent CHECK (
    (parent_link_id IS NOT NULL)
    OR
    (section_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS footer_links_owner_idx ON public.footer_links (owner_id);
CREATE INDEX IF NOT EXISTS footer_links_section_idx ON public.footer_links (section_id);
CREATE INDEX IF NOT EXISTS footer_links_parent_idx ON public.footer_links (parent_link_id);
CREATE INDEX IF NOT EXISTS footer_links_order_idx ON public.footer_links (order_index);
CREATE INDEX IF NOT EXISTS footer_links_active_idx ON public.footer_links (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_footer_links_updated_at ON public.footer_links;
CREATE TRIGGER set_footer_links_updated_at
BEFORE UPDATE ON public.footer_links
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Social links
-- =========================
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,      -- e.g., "github", "instagram"
  label TEXT NOT NULL,         -- e.g., "GitHub"
  href TEXT NOT NULL,
  icon TEXT,                   -- e.g., lucide icon name
  image TEXT,                  -- URL/path (optional)

  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT social_links_platform_nonempty CHECK (length(btrim(platform)) > 0),
  CONSTRAINT social_links_label_nonempty CHECK (length(btrim(label)) > 0),
  CONSTRAINT social_links_href_nonempty CHECK (length(btrim(href)) > 0)
);

CREATE INDEX IF NOT EXISTS social_links_owner_idx ON public.social_links (owner_id);
CREATE INDEX IF NOT EXISTS social_links_order_idx ON public.social_links (order_index);
CREATE INDEX IF NOT EXISTS social_links_active_idx ON public.social_links (is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS social_links_unique_per_owner_platform
  ON public.social_links (owner_id, platform);

DROP TRIGGER IF EXISTS set_social_links_updated_at ON public.social_links;
CREATE TRIGGER set_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Public: read only active items
DROP POLICY IF EXISTS "footer_sections_select_active" ON public.footer_sections;
CREATE POLICY "footer_sections_select_active"
ON public.footer_sections
FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "footer_links_select_active" ON public.footer_links;
CREATE POLICY "footer_links_select_active"
ON public.footer_links
FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "social_links_select_active" ON public.social_links;
CREATE POLICY "social_links_select_active"
ON public.social_links
FOR SELECT
USING (is_active = TRUE);

-- Owners manage their own footer sections
DROP POLICY IF EXISTS "footer_sections_insert_own" ON public.footer_sections;
CREATE POLICY "footer_sections_insert_own"
ON public.footer_sections
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_sections_update_own" ON public.footer_sections;
CREATE POLICY "footer_sections_update_own"
ON public.footer_sections
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_sections_delete_own" ON public.footer_sections;
CREATE POLICY "footer_sections_delete_own"
ON public.footer_sections
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Owners manage their own footer links
DROP POLICY IF EXISTS "footer_links_insert_own" ON public.footer_links;
CREATE POLICY "footer_links_insert_own"
ON public.footer_links
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_links_update_own" ON public.footer_links;
CREATE POLICY "footer_links_update_own"
ON public.footer_links
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_links_delete_own" ON public.footer_links;
CREATE POLICY "footer_links_delete_own"
ON public.footer_links
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Owners manage their own social links
DROP POLICY IF EXISTS "social_links_insert_own" ON public.social_links;
CREATE POLICY "social_links_insert_own"
ON public.social_links
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "social_links_update_own" ON public.social_links;
CREATE POLICY "social_links_update_own"
ON public.social_links
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "social_links_delete_own" ON public.social_links;
CREATE POLICY "social_links_delete_own"
ON public.social_links
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Convenience view: full footer model (sections + links)
CREATE OR REPLACE VIEW public.active_footer_sections_with_links AS
SELECT
  s.id AS section_id,
  s.title AS section_title,
  s.order_index AS section_order,
  l.id AS link_id,
  l.parent_link_id,
  l.label,
  l.href,
  l.is_external,
  l.target,
  l.icon,
  l.image,
  l.order_index AS link_order,
  l.metadata
FROM public.footer_sections s
LEFT JOIN public.footer_links l
  ON l.section_id = s.id
WHERE s.is_active = TRUE
  AND (l.id IS NULL OR l.is_active = TRUE)
ORDER BY s.order_index, s.title, l.order_index, l.label;

COMMENT ON TABLE public.footer_sections IS 'Footer navigation sections.';
COMMENT ON TABLE public.footer_links IS 'Footer links (supports nested sub-links).';
COMMENT ON TABLE public.social_links IS 'Footer/social links (icons/images).';
COMMENT ON VIEW public.active_footer_sections_with_links IS 'Active footer sections with active links.';
