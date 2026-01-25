-- Site branding (header/footer logos) + Supabase RLS policies (“rules”)
-- Supports:
-- - Header logo + footer logo (URL/path to Supabase Storage or external URL)
-- - Optional alt text
-- - Public can read only active branding
-- - Authenticated users can manage only their own branding row

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.site_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  header_logo TEXT,
  header_logo_alt TEXT,

  footer_logo TEXT,
  footer_logo_alt TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One branding row per owner
  CONSTRAINT site_branding_one_row_per_owner UNIQUE (owner_id),

  -- If logo is set, alt text can be empty; if you want to REQUIRE alt text, change these.
  CONSTRAINT site_branding_header_alt_len CHECK (header_logo_alt IS NULL OR length(header_logo_alt) <= 300),
  CONSTRAINT site_branding_footer_alt_len CHECK (footer_logo_alt IS NULL OR length(footer_logo_alt) <= 300)
);

CREATE INDEX IF NOT EXISTS site_branding_owner_idx ON public.site_branding (owner_id);
CREATE INDEX IF NOT EXISTS site_branding_active_idx ON public.site_branding (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_site_branding_updated_at ON public.site_branding;
CREATE TRIGGER set_site_branding_updated_at
BEFORE UPDATE ON public.site_branding
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

-- Public: read only active branding (safe for header/footer rendering)
DROP POLICY IF EXISTS "site_branding_select_active" ON public.site_branding;
CREATE POLICY "site_branding_select_active"
ON public.site_branding
FOR SELECT
USING (is_active = TRUE);

-- Owners: manage their own branding row
DROP POLICY IF EXISTS "site_branding_insert_own" ON public.site_branding;
CREATE POLICY "site_branding_insert_own"
ON public.site_branding
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "site_branding_update_own" ON public.site_branding;
CREATE POLICY "site_branding_update_own"
ON public.site_branding
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "site_branding_delete_own" ON public.site_branding;
CREATE POLICY "site_branding_delete_own"
ON public.site_branding
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Convenience view: the active branding row(s)
CREATE OR REPLACE VIEW public.active_site_branding AS
SELECT
  id,
  owner_id,
  header_logo,
  header_logo_alt,
  footer_logo,
  footer_logo_alt,
  metadata,
  updated_at
FROM public.site_branding
WHERE is_active = TRUE;

COMMENT ON TABLE public.site_branding IS 'Header/footer branding assets (logos) with Supabase RLS policies.';
COMMENT ON VIEW public.active_site_branding IS 'Active site branding row(s) for rendering header/footer logos.';
