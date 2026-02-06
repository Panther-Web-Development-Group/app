-- Homepage config + Affiliate organizations (PantherWeb globals)
-- Supports:
-- - Single-row homepage config per owner: title, hero (text/image/slideshow), welcome, about, technologies, analytics, section limits
-- - Affiliate organizations with name (full/short), logo (FK to media), description, website URL
-- - Public read active config; authenticated owners manage their own

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Homepage config (one row per owner)
-- =========================
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Title
  homepage_title TEXT,

  -- Hero: 'text' | 'image' | 'slideshow'; payload in hero_config
  hero_type TEXT NOT NULL DEFAULT 'text',
  hero_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Content
  welcome_text TEXT,
  about_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  technologies_used TEXT[] DEFAULT '{}',

  -- Analytic information
  founding_date DATE,
  member_count INTEGER,
  github_repos_count INTEGER,

  -- Section limits (how many to show; app queries by date/order)
  upcoming_events_limit INTEGER DEFAULT 5,
  announcements_limit INTEGER DEFAULT 5,
  featured_posts_limit INTEGER DEFAULT 5,

  -- Additional sections (flexible JSON)
  additional_sections JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT homepage_config_owner_unique UNIQUE (owner_id),
  CONSTRAINT homepage_config_hero_type_valid CHECK (
    hero_type IN ('text', 'image', 'slideshow')
  ),
  CONSTRAINT homepage_config_limits_non_negative CHECK (
    (upcoming_events_limit IS NULL OR upcoming_events_limit >= 0) AND
    (announcements_limit IS NULL OR announcements_limit >= 0) AND
    (featured_posts_limit IS NULL OR featured_posts_limit >= 0) AND
    (member_count IS NULL OR member_count >= 0) AND
    (github_repos_count IS NULL OR github_repos_count >= 0)
  )
);

CREATE INDEX IF NOT EXISTS homepage_config_owner_idx ON public.homepage_config (owner_id);

DROP TRIGGER IF EXISTS set_homepage_config_updated_at ON public.homepage_config;
CREATE TRIGGER set_homepage_config_updated_at
BEFORE UPDATE ON public.homepage_config
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Affiliate organizations (homepage + footer)
-- =========================
CREATE TABLE IF NOT EXISTS public.affiliate_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name_full TEXT NOT NULL,
  name_short TEXT,
  logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  description TEXT,
  website_url TEXT,

  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT affiliate_organizations_name_full_nonempty CHECK (length(btrim(name_full)) > 0)
);

CREATE INDEX IF NOT EXISTS affiliate_organizations_owner_idx ON public.affiliate_organizations (owner_id);
CREATE INDEX IF NOT EXISTS affiliate_organizations_order_idx ON public.affiliate_organizations (order_index);
CREATE INDEX IF NOT EXISTS affiliate_organizations_active_idx ON public.affiliate_organizations (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_affiliate_organizations_updated_at ON public.affiliate_organizations;
CREATE TRIGGER set_affiliate_organizations_updated_at
BEFORE UPDATE ON public.affiliate_organizations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS
-- =========================
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_organizations ENABLE ROW LEVEL SECURITY;

-- Homepage config: public can read (single row per site)
DROP POLICY IF EXISTS "homepage_config_select_public" ON public.homepage_config;
CREATE POLICY "homepage_config_select_public"
ON public.homepage_config FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "homepage_config_insert_own" ON public.homepage_config;
CREATE POLICY "homepage_config_insert_own"
ON public.homepage_config FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "homepage_config_update_own" ON public.homepage_config;
CREATE POLICY "homepage_config_update_own"
ON public.homepage_config FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "homepage_config_delete_own" ON public.homepage_config;
CREATE POLICY "homepage_config_delete_own"
ON public.homepage_config FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Affiliate organizations: public read active
DROP POLICY IF EXISTS "affiliate_organizations_select_active" ON public.affiliate_organizations;
CREATE POLICY "affiliate_organizations_select_active"
ON public.affiliate_organizations FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "affiliate_organizations_select_own" ON public.affiliate_organizations;
CREATE POLICY "affiliate_organizations_select_own"
ON public.affiliate_organizations FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "affiliate_organizations_insert_own" ON public.affiliate_organizations;
CREATE POLICY "affiliate_organizations_insert_own"
ON public.affiliate_organizations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "affiliate_organizations_update_own" ON public.affiliate_organizations;
CREATE POLICY "affiliate_organizations_update_own"
ON public.affiliate_organizations FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "affiliate_organizations_delete_own" ON public.affiliate_organizations;
CREATE POLICY "affiliate_organizations_delete_own"
ON public.affiliate_organizations FOR DELETE TO authenticated USING (owner_id = auth.uid());

COMMENT ON TABLE public.homepage_config IS 'Homepage configuration: title, hero (text/image/slideshow), welcome, about, technologies, analytics, section limits.';
COMMENT ON TABLE public.affiliate_organizations IS 'Affiliate organizations: name (full/short), logo (FK media), description, website URL.';
