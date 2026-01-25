-- Page hero options (image + layout)
-- Adds:
-- - hero_image_enabled: explicit toggle
-- - hero_image_url / hero_image_alt: URL-based hero image metadata
-- - hero_constrain_to_container: whether hero layout is constrained to the content wrapper
--
-- Notes:
-- - Idempotent: uses ADD COLUMN IF NOT EXISTS and replaces constraints.
-- - Does not alter RLS policies (existing SELECT/INSERT/UPDATE policies remain valid).

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS hero_image_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_alt TEXT,
  ADD COLUMN IF NOT EXISTS hero_constrain_to_container BOOLEAN NOT NULL DEFAULT TRUE;

-- Optional fields, but if provided must be non-empty after trim
ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_hero_image_url_nonempty;
ALTER TABLE public.pages
  ADD CONSTRAINT pages_hero_image_url_nonempty
  CHECK (hero_image_url IS NULL OR length(btrim(hero_image_url)) > 0);

ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_hero_image_alt_nonempty;
ALTER TABLE public.pages
  ADD CONSTRAINT pages_hero_image_alt_nonempty
  CHECK (hero_image_alt IS NULL OR length(btrim(hero_image_alt)) > 0);

-- If hero image is enabled, require a hero image URL.
ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_hero_image_enabled_requires_url;
ALTER TABLE public.pages
  ADD CONSTRAINT pages_hero_image_enabled_requires_url
  CHECK (NOT hero_image_enabled OR hero_image_url IS NOT NULL);

