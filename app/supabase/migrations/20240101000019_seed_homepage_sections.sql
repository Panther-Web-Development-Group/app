-- Seed a homepage built with page sections
-- Notes:
-- - Publishes only after sections exist (to satisfy validate_published_page_body trigger)
-- - If an existing 'home' page already has non-empty whole-page content, we do NOT overwrite it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_author_id UUID;
  v_page_id UUID;
BEGIN
  -- Prefer an existing user (first created) as the author for seeded content.
  SELECT id INTO v_author_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_author_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users; skipping homepage seed. Create a user first, then re-run this migration.';
    RETURN;
  END IF;

  -- Ensure a 'home' page exists (draft first)
  SELECT id INTO v_page_id
  FROM public.pages
  WHERE slug = 'home'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    v_page_id := '00000000-0000-0000-0000-000000000200';

    INSERT INTO public.pages (
      id, author_id, title, slug, summary, content, render_mode, is_published, published_at
    ) VALUES (
      v_page_id,
      v_author_id,
      'Home',
      'home',
      'Welcome to the site — powered by your CMS.',
      '{}'::jsonb,
      'sections',
      FALSE,
      NULL
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- If the existing home page has empty whole-page content, switch it to sections mode for the seed.
  UPDATE public.pages
  SET render_mode = 'sections'
  WHERE slug = 'home'
    AND render_mode = 'whole'
    AND COALESCE(content, '{}'::jsonb) = '{}'::jsonb;

  -- Only seed sections if the page is in sections mode
  SELECT id INTO v_page_id
  FROM public.pages
  WHERE slug = 'home'
    AND render_mode = 'sections'
  LIMIT 1;

  IF v_page_id IS NULL THEN
    RAISE NOTICE 'Home page exists but is not in sections mode (and has content). Skipping section seed.';
    RETURN;
  END IF;

  -- Seed sections (idempotent via fixed UUIDs)
  INSERT INTO public.page_sections (
    id, page_id, title, icon, width, column_span, order_index, content
  ) VALUES
    (
      '00000000-0000-0000-0000-000000000201',
      v_page_id,
      'Hero',
      'home',
      'full',
      NULL,
      0,
      jsonb_build_object(
        'type', 'hero',
        'headline', 'Welcome',
        'subheadline', 'This homepage is built from sections (full + partial widths).'
      )
    ),
    (
      '00000000-0000-0000-0000-000000000202',
      v_page_id,
      'Get started',
      'sparkles',
      'partial',
      6,
      10,
      jsonb_build_object(
        'type', 'card',
        'title', 'Create content',
        'body', 'Go to Admin → Pages to create and publish new pages.'
      )
    ),
    (
      '00000000-0000-0000-0000-000000000203',
      v_page_id,
      'Manage',
      'settings',
      'partial',
      6,
      11,
      jsonb_build_object(
        'type', 'card',
        'title', 'Manage navigation',
        'body', 'Update your sidebar navigation items from the admin dashboard.'
      )
    ),
    (
      '00000000-0000-0000-0000-000000000204',
      v_page_id,
      'About',
      'info',
      'full',
      NULL,
      20,
      jsonb_build_object(
        'type', 'richText',
        'html', '<p>Edit these sections later once your section renderer is wired up.</p>'
      )
    )
  ON CONFLICT (id) DO UPDATE SET
    page_id = EXCLUDED.page_id,
    title = EXCLUDED.title,
    icon = EXCLUDED.icon,
    width = EXCLUDED.width,
    column_span = EXCLUDED.column_span,
    order_index = EXCLUDED.order_index,
    content = EXCLUDED.content;

  -- Publish the page (now that sections exist)
  UPDATE public.pages
  SET is_published = TRUE,
      published_at = COALESCE(published_at, NOW())
  WHERE id = v_page_id;
END $$;

