-- Add missing "owner/author can SELECT their own rows" RLS policies.
-- Without these, authenticated users can often insert/update/delete,
-- but cannot read their own inactive/draft content in admin screens.

-- =========================
-- Tags & Categories
-- =========================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
CREATE POLICY "categories_select_own"
ON public.categories
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "tags_select_own" ON public.tags;
CREATE POLICY "tags_select_own"
ON public.tags
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- =========================
-- Comments
-- =========================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_own" ON public.comments;
CREATE POLICY "comments_select_own"
ON public.comments
FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- =========================
-- Polls
-- =========================
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "polls_select_own" ON public.polls;
CREATE POLICY "polls_select_own"
ON public.polls
FOR SELECT
TO authenticated
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "poll_options_select_own" ON public.poll_options;
CREATE POLICY "poll_options_select_own"
ON public.poll_options
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.author_id = auth.uid()
  )
);

-- =========================
-- Quizzes
-- =========================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_select_own" ON public.quizzes;
CREATE POLICY "quizzes_select_own"
ON public.quizzes
FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- =========================
-- Events: allow owners to read their own event categories (including inactive)
-- =========================
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_categories_select_own" ON public.event_categories;
CREATE POLICY "event_categories_select_own"
ON public.event_categories
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- =========================
-- Site Branding: allow owners to read their own branding (including inactive)
-- =========================
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_branding_select_own" ON public.site_branding;
CREATE POLICY "site_branding_select_own"
ON public.site_branding
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

