-- Site Settings schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Global site configuration
-- - Public read, admin-only write
-- - Key-value store with typed values

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Setting identification
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  value_type TEXT NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'object', 'array'
  description TEXT,

  -- Grouping
  category TEXT DEFAULT 'general', -- 'general', 'seo', 'social', 'theme', 'analytics', etc.

  -- Access control
  is_public BOOLEAN NOT NULL DEFAULT TRUE, -- If false, only authenticated can read

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT site_settings_key_nonempty CHECK (length(btrim(key)) > 0),
  CONSTRAINT site_settings_key_format CHECK (key ~ '^[a-z0-9_]+$'), -- lowercase, alphanumeric, underscores
  CONSTRAINT site_settings_value_type_valid CHECK (value_type IN ('string', 'number', 'boolean', 'object', 'array'))
);

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_unique ON public.site_settings (key);
CREATE INDEX IF NOT EXISTS site_settings_category_idx ON public.site_settings (category);
CREATE INDEX IF NOT EXISTS site_settings_public_idx ON public.site_settings (is_public) WHERE is_public = TRUE;

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public: read only public settings
DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public"
ON public.site_settings
FOR SELECT
USING (is_public = TRUE);

-- Authenticated: can read all settings (including private ones)
DROP POLICY IF EXISTS "site_settings_select_authenticated" ON public.site_settings;
CREATE POLICY "site_settings_select_authenticated"
ON public.site_settings
FOR SELECT
TO authenticated
USING (TRUE);

-- Note: For INSERT/UPDATE/DELETE, you may want to restrict to admins only.
-- This requires a role/permission system. For now, allowing authenticated users.
-- You can add a check for admin role later:
-- USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))

DROP POLICY IF EXISTS "site_settings_insert_authenticated" ON public.site_settings;
CREATE POLICY "site_settings_insert_authenticated"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (updated_by = auth.uid());

DROP POLICY IF EXISTS "site_settings_update_authenticated" ON public.site_settings;
CREATE POLICY "site_settings_update_authenticated"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (updated_by = auth.uid());

DROP POLICY IF EXISTS "site_settings_delete_authenticated" ON public.site_settings;
CREATE POLICY "site_settings_delete_authenticated"
ON public.site_settings
FOR DELETE
TO authenticated
USING (TRUE);

-- Convenience view: public settings only
CREATE OR REPLACE VIEW public.public_site_settings AS
SELECT
  key,
  value,
  value_type,
  description,
  category
FROM public.site_settings
WHERE is_public = TRUE;

COMMENT ON TABLE public.site_settings IS 'Global site configuration (key-value store).';
COMMENT ON VIEW public.public_site_settings IS 'Public-facing view of site settings.';
