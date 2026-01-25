-- Polls + Quizzes schema + Supabase RLS policies (“rules”)
-- Goals:
-- - Public can read only published polls/quizzes (and their questions/options)
-- - Authenticated users can vote/submit once per poll/quiz (enforced with UNIQUE)
-- - Users can only manage their own votes/submissions
-- - Results can be exposed via aggregate views (no need to expose raw voter identities)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Polls
-- =========================
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT polls_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT polls_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS polls_slug_unique ON public.polls (slug);
CREATE INDEX IF NOT EXISTS polls_published_idx ON public.polls (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS polls_author_idx ON public.polls (author_id);

DROP TRIGGER IF EXISTS set_polls_updated_at ON public.polls;
CREATE TRIGGER set_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT poll_options_label_nonempty CHECK (length(btrim(label)) > 0)
);

CREATE INDEX IF NOT EXISTS poll_options_poll_idx ON public.poll_options (poll_id);
CREATE INDEX IF NOT EXISTS poll_options_order_idx ON public.poll_options (poll_id, order_index);

-- One vote per user per poll (single-choice poll)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT poll_votes_unique_voter_per_poll UNIQUE (poll_id, voter_id)
);

CREATE INDEX IF NOT EXISTS poll_votes_poll_idx ON public.poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS poll_votes_option_idx ON public.poll_votes (option_id);
CREATE INDEX IF NOT EXISTS poll_votes_voter_idx ON public.poll_votes (voter_id);

-- =========================
-- Polls RLS
-- =========================
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Public: read published polls/options
DROP POLICY IF EXISTS "polls_select_published" ON public.polls;
CREATE POLICY "polls_select_published"
ON public.polls
FOR SELECT
USING (is_published = TRUE);

DROP POLICY IF EXISTS "poll_options_select_published" ON public.poll_options;
CREATE POLICY "poll_options_select_published"
ON public.poll_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.is_published = TRUE
  )
);

-- Authors manage their own polls/options
DROP POLICY IF EXISTS "polls_insert_own" ON public.polls;
CREATE POLICY "polls_insert_own"
ON public.polls
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "polls_update_own" ON public.polls;
CREATE POLICY "polls_update_own"
ON public.polls
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "polls_delete_own" ON public.polls;
CREATE POLICY "polls_delete_own"
ON public.polls
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "poll_options_insert_own" ON public.poll_options;
CREATE POLICY "poll_options_insert_own"
ON public.poll_options
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "poll_options_update_own" ON public.poll_options;
CREATE POLICY "poll_options_update_own"
ON public.poll_options
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "poll_options_delete_own" ON public.poll_options;
CREATE POLICY "poll_options_delete_own"
ON public.poll_options
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.polls p
    WHERE p.id = poll_options.poll_id AND p.author_id = auth.uid()
  )
);

-- Votes: allow authenticated users to vote on published + open polls (one per poll)
DROP POLICY IF EXISTS "poll_votes_select_none" ON public.poll_votes;
CREATE POLICY "poll_votes_select_none"
ON public.poll_votes
FOR SELECT
USING (FALSE);

DROP POLICY IF EXISTS "poll_votes_insert_on_published_open" ON public.poll_votes;
CREATE POLICY "poll_votes_insert_on_published_open"
ON public.poll_votes
FOR INSERT
TO authenticated
WITH CHECK (
  voter_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.polls p
    JOIN public.poll_options o ON o.poll_id = p.id
    WHERE p.id = poll_votes.poll_id
      AND o.id = poll_votes.option_id
      AND p.is_published = TRUE
      AND (p.closes_at IS NULL OR p.closes_at > NOW())
  )
);

DROP POLICY IF EXISTS "poll_votes_update_own" ON public.poll_votes;
CREATE POLICY "poll_votes_update_own"
ON public.poll_votes
FOR UPDATE
TO authenticated
USING (voter_id = auth.uid())
WITH CHECK (voter_id = auth.uid());

DROP POLICY IF EXISTS "poll_votes_delete_own" ON public.poll_votes;
CREATE POLICY "poll_votes_delete_own"
ON public.poll_votes
FOR DELETE
TO authenticated
USING (voter_id = auth.uid());

-- Aggregate poll results per option
CREATE OR REPLACE VIEW public.poll_results AS
SELECT
  p.id AS poll_id,
  o.id AS option_id,
  o.label,
  COUNT(v.id)::int AS votes
FROM public.polls p
JOIN public.poll_options o ON o.poll_id = p.id
LEFT JOIN public.poll_votes v ON v.option_id = o.id
GROUP BY p.id, o.id, o.label;

-- =========================
-- Quizzes
-- =========================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quizzes_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT quizzes_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS quizzes_slug_unique ON public.quizzes (slug);
CREATE INDEX IF NOT EXISTS quizzes_published_idx ON public.quizzes (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS quizzes_author_idx ON public.quizzes (author_id);

DROP TRIGGER IF EXISTS set_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER set_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_questions_prompt_nonempty CHECK (length(btrim(prompt)) > 0)
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_idx ON public.quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_questions_order_idx ON public.quiz_questions (quiz_id, order_index);

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_options_label_nonempty CHECK (length(btrim(label)) > 0)
);

CREATE INDEX IF NOT EXISTS quiz_options_question_idx ON public.quiz_options (question_id);
CREATE INDEX IF NOT EXISTS quiz_options_order_idx ON public.quiz_options (question_id, order_index);

-- A user submission for a quiz (one per user per quiz)
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_submissions_unique_user_per_quiz UNIQUE (quiz_id, user_id)
);

CREATE INDEX IF NOT EXISTS quiz_submissions_quiz_idx ON public.quiz_submissions (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_submissions_user_idx ON public.quiz_submissions (user_id);

-- Answers within a submission (single-choice per question)
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.quiz_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT quiz_answers_unique_question_per_submission UNIQUE (submission_id, question_id)
);

CREATE INDEX IF NOT EXISTS quiz_answers_submission_idx ON public.quiz_answers (submission_id);
CREATE INDEX IF NOT EXISTS quiz_answers_question_idx ON public.quiz_answers (question_id);
CREATE INDEX IF NOT EXISTS quiz_answers_option_idx ON public.quiz_answers (option_id);

-- =========================
-- Quizzes RLS
-- =========================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Public: read published quizzes/questions/options (but NOT correct flags ideally).
-- Note: this allows reading `is_correct`. If you want to hide answers, store correctness
-- server-side only or expose a restricted view without `is_correct`.
DROP POLICY IF EXISTS "quizzes_select_published" ON public.quizzes;
CREATE POLICY "quizzes_select_published"
ON public.quizzes
FOR SELECT
USING (is_published = TRUE);

DROP POLICY IF EXISTS "quiz_questions_select_published" ON public.quiz_questions;
CREATE POLICY "quiz_questions_select_published"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id AND q.is_published = TRUE
  )
);

DROP POLICY IF EXISTS "quiz_options_select_published" ON public.quiz_options;
CREATE POLICY "quiz_options_select_published"
ON public.quiz_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    WHERE qq.id = quiz_options.question_id AND q.is_published = TRUE
  )
);

-- Authors manage their own quizzes/questions/options
DROP POLICY IF EXISTS "quizzes_insert_own" ON public.quizzes;
CREATE POLICY "quizzes_insert_own"
ON public.quizzes
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "quizzes_update_own" ON public.quizzes;
CREATE POLICY "quizzes_update_own"
ON public.quizzes
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "quizzes_delete_own" ON public.quizzes;
CREATE POLICY "quizzes_delete_own"
ON public.quizzes
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "quiz_questions_manage_own" ON public.quiz_questions;
CREATE POLICY "quiz_questions_manage_own"
ON public.quiz_questions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id AND q.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id AND q.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "quiz_options_manage_own" ON public.quiz_options;
CREATE POLICY "quiz_options_manage_own"
ON public.quiz_options
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    WHERE qq.id = quiz_options.question_id AND q.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    WHERE qq.id = quiz_options.question_id AND q.author_id = auth.uid()
  )
);

-- Submissions/answers:
-- - direct SELECT is restricted (users can read only their own submissions/answers)
-- - insert allowed only on published + open quizzes
DROP POLICY IF EXISTS "quiz_submissions_select_own" ON public.quiz_submissions;
CREATE POLICY "quiz_submissions_select_own"
ON public.quiz_submissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "quiz_submissions_insert_own_on_published_open" ON public.quiz_submissions;
CREATE POLICY "quiz_submissions_insert_own_on_published_open"
ON public.quiz_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_submissions.quiz_id
      AND q.is_published = TRUE
      AND (q.closes_at IS NULL OR q.closes_at > NOW())
  )
);

DROP POLICY IF EXISTS "quiz_submissions_delete_own" ON public.quiz_submissions;
CREATE POLICY "quiz_submissions_delete_own"
ON public.quiz_submissions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "quiz_answers_select_own" ON public.quiz_answers;
CREATE POLICY "quiz_answers_select_own"
ON public.quiz_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions s
    WHERE s.id = quiz_answers.submission_id AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "quiz_answers_insert_own" ON public.quiz_answers;
CREATE POLICY "quiz_answers_insert_own"
ON public.quiz_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions s
    JOIN public.quizzes q ON q.id = s.quiz_id
    JOIN public.quiz_questions qq ON qq.id = quiz_answers.question_id AND qq.quiz_id = q.id
    JOIN public.quiz_options qo ON qo.id = quiz_answers.option_id AND qo.question_id = qq.id
    WHERE s.id = quiz_answers.submission_id
      AND s.user_id = auth.uid()
      AND q.is_published = TRUE
      AND (q.closes_at IS NULL OR q.closes_at > NOW())
  )
);

DROP POLICY IF EXISTS "quiz_answers_update_own" ON public.quiz_answers;
CREATE POLICY "quiz_answers_update_own"
ON public.quiz_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions s
    WHERE s.id = quiz_answers.submission_id AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions s
    WHERE s.id = quiz_answers.submission_id AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "quiz_answers_delete_own" ON public.quiz_answers;
CREATE POLICY "quiz_answers_delete_own"
ON public.quiz_answers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_submissions s
    WHERE s.id = quiz_answers.submission_id AND s.user_id = auth.uid()
  )
);

-- Quiz analytics (counts only; no user ids)
CREATE OR REPLACE VIEW public.quiz_submission_counts AS
SELECT
  q.id AS quiz_id,
  COUNT(s.id)::int AS submissions
FROM public.quizzes q
LEFT JOIN public.quiz_submissions s ON s.quiz_id = q.id
GROUP BY q.id;

COMMENT ON TABLE public.polls IS 'Polls (single-choice) with Supabase RLS policies.';
COMMENT ON TABLE public.quizzes IS 'Quizzes with questions/options and user submissions.';
COMMENT ON VIEW public.poll_results IS 'Aggregated poll vote counts per option.';
COMMENT ON VIEW public.quiz_submission_counts IS 'Aggregated submission counts per quiz.';
