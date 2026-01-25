-- Add title + icon support to page sections
-- Safe/idempotent: uses ADD COLUMN IF NOT EXISTS and replaces constraints

ALTER TABLE public.page_sections
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT;

-- Optional fields, but if provided must be non-empty after trim
ALTER TABLE public.page_sections
  DROP CONSTRAINT IF EXISTS page_sections_title_nonempty;
ALTER TABLE public.page_sections
  ADD CONSTRAINT page_sections_title_nonempty
  CHECK (title IS NULL OR length(btrim(title)) > 0);

ALTER TABLE public.page_sections
  DROP CONSTRAINT IF EXISTS page_sections_icon_nonempty;
ALTER TABLE public.page_sections
  ADD CONSTRAINT page_sections_icon_nonempty
  CHECK (icon IS NULL OR length(btrim(icon)) > 0);

