-- Header config (PantherWeb globals)
-- Supports:
-- - Editable placeholder text (e.g. search box)
-- - Editable search URL
-- - One row per owner; public read, owners manage their own

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.header_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  placeholder_text TEXT,
  search_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT header_config_owner_unique UNIQUE (owner_id)
);

CREATE INDEX IF NOT EXISTS header_config_owner_idx ON public.header_config (owner_id);

DROP TRIGGER IF EXISTS set_header_config_updated_at ON public.header_config;
CREATE TRIGGER set_header_config_updated_at
BEFORE UPDATE ON public.header_config
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.header_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "header_config_select_public" ON public.header_config;
CREATE POLICY "header_config_select_public"
ON public.header_config FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "header_config_insert_own" ON public.header_config;
CREATE POLICY "header_config_insert_own"
ON public.header_config FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "header_config_update_own" ON public.header_config;
CREATE POLICY "header_config_update_own"
ON public.header_config FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "header_config_delete_own" ON public.header_config;
CREATE POLICY "header_config_delete_own"
ON public.header_config FOR DELETE TO authenticated USING (owner_id = auth.uid());

COMMENT ON TABLE public.header_config IS 'Header configuration: placeholder text and search URL.';
