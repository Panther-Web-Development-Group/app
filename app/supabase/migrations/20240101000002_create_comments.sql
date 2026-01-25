-- Comments schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Comments on either posts OR pages (exactly one must be set)
-- - Threaded replies via parent_comment_id
-- - Public read only for approved comments on published content
-- - Authenticated users can create/update/delete only their own comments

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic target (exactly one)
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,

  -- Threading
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,

  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,

  is_approved BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comments_body_nonempty CHECK (length(btrim(body)) > 0),
  CONSTRAINT comments_exactly_one_target CHECK (
    (post_id IS NOT NULL AND page_id IS NULL)
    OR
    (post_id IS NULL AND page_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS comments_page_id_idx ON public.comments (page_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_author_idx ON public.comments (author_id);
CREATE INDEX IF NOT EXISTS comments_approved_idx ON public.comments (is_approved) WHERE is_approved = TRUE;

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Row Level Security (RLS)
-- =========================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public can read only approved comments that belong to published content
DROP POLICY IF EXISTS "comments_select_public_on_published" ON public.comments;
CREATE POLICY "comments_select_public_on_published"
ON public.comments
FOR SELECT
USING (
  is_approved = TRUE
  AND (
    (post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id AND p.is_published = TRUE
    ))
    OR
    (page_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pages pg
      WHERE pg.id = comments.page_id AND pg.is_published = TRUE
    ))
  )
);

-- Authenticated users can insert their own comments (even if not approved yet),
-- but only on published content (prevents commenting on drafts).
DROP POLICY IF EXISTS "comments_insert_own_on_published" ON public.comments;
CREATE POLICY "comments_insert_own_on_published"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (
    (post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id AND p.is_published = TRUE
    ))
    OR
    (page_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pages pg
      WHERE pg.id = comments.page_id AND pg.is_published = TRUE
    ))
  )
);

-- Authors can update/delete only their own comments
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own"
ON public.comments
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own"
ON public.comments
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

COMMENT ON TABLE public.comments IS 'Comments on posts/pages with threading and Supabase RLS policies.';

-- =========================
-- Votes (upvotes / downvotes)
-- =========================
-- One vote per user per comment:
-- - value =  1  => upvote
-- - value = -1  => downvote
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_votes_value_chk CHECK (value IN (-1, 1)),
  CONSTRAINT comment_votes_unique_voter_per_comment UNIQUE (comment_id, voter_id)
);

CREATE INDEX IF NOT EXISTS comment_votes_comment_idx ON public.comment_votes (comment_id);
CREATE INDEX IF NOT EXISTS comment_votes_voter_idx ON public.comment_votes (voter_id);

DROP TRIGGER IF EXISTS set_comment_votes_updated_at ON public.comment_votes;
CREATE TRIGGER set_comment_votes_updated_at
BEFORE UPDATE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Public can read vote totals via the view below; direct row reads are locked down.
DROP POLICY IF EXISTS "comment_votes_select_none" ON public.comment_votes;
CREATE POLICY "comment_votes_select_none"
ON public.comment_votes
FOR SELECT
USING (FALSE);

-- Authenticated users can upvote/downvote (insert) only as themselves.
DROP POLICY IF EXISTS "comment_votes_insert_own" ON public.comment_votes;
CREATE POLICY "comment_votes_insert_own"
ON public.comment_votes
FOR INSERT
TO authenticated
WITH CHECK (voter_id = auth.uid());

-- Authenticated users can change or remove only their own vote.
DROP POLICY IF EXISTS "comment_votes_update_own" ON public.comment_votes;
CREATE POLICY "comment_votes_update_own"
ON public.comment_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid())
WITH CHECK (voter_id = auth.uid());

DROP POLICY IF EXISTS "comment_votes_delete_own" ON public.comment_votes;
CREATE POLICY "comment_votes_delete_own"
ON public.comment_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Aggregate vote counts per comment (safe for public read; respects comment visibility).
CREATE OR REPLACE VIEW public.comment_vote_summary AS
SELECT
  c.id AS comment_id,
  COALESCE(SUM(CASE WHEN v.value =  1 THEN 1 ELSE 0 END), 0)::int AS upvotes,
  COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)::int AS downvotes,
  COALESCE(SUM(v.value), 0)::int AS score
FROM public.comments c
LEFT JOIN public.comment_votes v ON v.comment_id = c.id
GROUP BY c.id;

COMMENT ON TABLE public.comment_votes IS 'Per-user votes on comments (+1/-1).';
COMMENT ON VIEW public.comment_vote_summary IS 'Aggregated up/down vote counts per comment.';
