-- Add media FK refs + header logo text to site_branding (PantherWeb)
-- Spec: Header/sidebar/footer logo and favicon as reference to media bucket (FK to media_assets).
-- Allow header logo text to be edited (header_logo_text).
-- Idempotent: ADD COLUMN IF NOT EXISTS; update active_site_branding view.
-- Ensure icon/theme columns exist so the view works even if migration 22 was not applied.

-- Icon/theme columns (from 20240101000022) — IF NOT EXISTS so safe when 22 already ran
ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS favicon_ico TEXT,
  ADD COLUMN IF NOT EXISTS favicon_svg TEXT,
  ADD COLUMN IF NOT EXISTS apple_touch_icon TEXT,
  ADD COLUMN IF NOT EXISTS android_chrome_192 TEXT,
  ADD COLUMN IF NOT EXISTS android_chrome_512 TEXT,
  ADD COLUMN IF NOT EXISTS web_manifest TEXT,
  ADD COLUMN IF NOT EXISTS theme_color TEXT,
  ADD COLUMN IF NOT EXISTS background_color TEXT;

-- Media refs + logo text
ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS header_logo_text TEXT,
  ADD COLUMN IF NOT EXISTS header_logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sidebar_logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sidebar_logo_text TEXT,
  ADD COLUMN IF NOT EXISTS footer_logo_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS footer_logo_text TEXT,
  ADD COLUMN IF NOT EXISTS favicon_media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS site_branding_header_logo_media_idx ON public.site_branding (header_logo_media_id) WHERE header_logo_media_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS site_branding_sidebar_logo_media_idx ON public.site_branding (sidebar_logo_media_id) WHERE sidebar_logo_media_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS site_branding_footer_logo_media_idx ON public.site_branding (footer_logo_media_id) WHERE footer_logo_media_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS site_branding_favicon_media_idx ON public.site_branding (favicon_media_id) WHERE favicon_media_id IS NOT NULL;

-- active_site_branding: drop and recreate so new columns can be added (REPLACE would fail: column order/count changed)
DROP VIEW IF EXISTS public.active_site_branding;
CREATE VIEW public.active_site_branding AS
SELECT
  id,
  owner_id,
  header_logo,
  header_logo_alt,
  header_logo_text,
  header_logo_media_id,
  sidebar_logo_media_id,
  sidebar_logo_text,
  footer_logo,
  footer_logo_alt,
  footer_logo_text,
  footer_logo_media_id,
  favicon_media_id,
  metadata,
  updated_at,
  favicon_ico,
  favicon_svg,
  apple_touch_icon,
  android_chrome_192,
  android_chrome_512,
  web_manifest,
  theme_color,
  background_color
FROM public.site_branding
WHERE is_active = TRUE;

COMMENT ON COLUMN public.site_branding.header_logo_text IS 'Editable header logo text (display name).';
COMMENT ON COLUMN public.site_branding.header_logo_media_id IS 'Reference to image in media bucket (FK to media_assets).';
COMMENT ON COLUMN public.site_branding.sidebar_logo_media_id IS 'Reference to sidebar logo image in media bucket.';
COMMENT ON COLUMN public.site_branding.footer_logo_media_id IS 'Reference to footer logo image in media bucket.';
COMMENT ON COLUMN public.site_branding.favicon_media_id IS 'Reference to favicon image in media bucket.';
