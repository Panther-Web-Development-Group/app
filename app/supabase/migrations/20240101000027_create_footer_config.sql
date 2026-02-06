-- Footer config: contact + copyright (PantherWeb globals)
-- Supports:
-- - Contact: email, phone, website
-- - Copyright text
-- - One row per owner; public read, owners manage their own
-- Note: Footer nav and social links remain in footer_sections, footer_links, social_links.
-- Spec: "footer navigation links on a section is one level" — render only top-level links (parent_link_id IS NULL) per section.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.footer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  contact_email TEXT,
  contact_phone TEXT,
  contact_website TEXT,
  copyright_text TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT footer_config_owner_unique UNIQUE (owner_id)
);

CREATE INDEX IF NOT EXISTS footer_config_owner_idx ON public.footer_config (owner_id);

DROP TRIGGER IF EXISTS set_footer_config_updated_at ON public.footer_config;
CREATE TRIGGER set_footer_config_updated_at
BEFORE UPDATE ON public.footer_config
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "footer_config_select_public" ON public.footer_config;
CREATE POLICY "footer_config_select_public"
ON public.footer_config FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "footer_config_insert_own" ON public.footer_config;
CREATE POLICY "footer_config_insert_own"
ON public.footer_config FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_config_update_own" ON public.footer_config;
CREATE POLICY "footer_config_update_own"
ON public.footer_config FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "footer_config_delete_own" ON public.footer_config;
CREATE POLICY "footer_config_delete_own"
ON public.footer_config FOR DELETE TO authenticated USING (owner_id = auth.uid());

COMMENT ON TABLE public.footer_config IS 'Footer configuration: contact (email, phone, website) and copyright text.';
