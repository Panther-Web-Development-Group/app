-- Add favicon + app icon fields to site_branding
-- Notes:
-- - Idempotent: uses ADD COLUMN IF NOT EXISTS and replaces constraints.
-- - Does not alter RLS policies (existing policies remain valid).

ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS favicon_ico TEXT,
  ADD COLUMN IF NOT EXISTS favicon_svg TEXT,
  ADD COLUMN IF NOT EXISTS apple_touch_icon TEXT,
  ADD COLUMN IF NOT EXISTS android_chrome_192 TEXT,
  ADD COLUMN IF NOT EXISTS android_chrome_512 TEXT,
  ADD COLUMN IF NOT EXISTS web_manifest TEXT,
  ADD COLUMN IF NOT EXISTS theme_color TEXT,
  ADD COLUMN IF NOT EXISTS background_color TEXT;

-- Optional fields, but if provided must be non-empty after trim
ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_favicon_ico_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_favicon_ico_nonempty
  CHECK (favicon_ico IS NULL OR length(btrim(favicon_ico)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_favicon_svg_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_favicon_svg_nonempty
  CHECK (favicon_svg IS NULL OR length(btrim(favicon_svg)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_apple_touch_icon_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_apple_touch_icon_nonempty
  CHECK (apple_touch_icon IS NULL OR length(btrim(apple_touch_icon)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_android_chrome_192_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_android_chrome_192_nonempty
  CHECK (android_chrome_192 IS NULL OR length(btrim(android_chrome_192)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_android_chrome_512_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_android_chrome_512_nonempty
  CHECK (android_chrome_512 IS NULL OR length(btrim(android_chrome_512)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_web_manifest_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_web_manifest_nonempty
  CHECK (web_manifest IS NULL OR length(btrim(web_manifest)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_theme_color_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_theme_color_nonempty
  CHECK (theme_color IS NULL OR length(btrim(theme_color)) > 0);

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_background_color_nonempty;
ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_background_color_nonempty
  CHECK (background_color IS NULL OR length(btrim(background_color)) > 0);

-- active_site_branding selects explicit columns; keep it in sync
CREATE OR REPLACE VIEW public.active_site_branding AS
SELECT
  id,
  owner_id,
  header_logo,
  header_logo_alt,
  footer_logo,
  footer_logo_alt,
  metadata,
  updated_at,
  -- New columns must be appended for CREATE OR REPLACE VIEW compatibility
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

