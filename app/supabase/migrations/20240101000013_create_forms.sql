-- Forms & Form Submissions schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Dynamic form definitions
-- - Form fields with validation
-- - Form submissions
-- - Public can submit, authenticated users can read their own submissions

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
-- Forms
-- =========================
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- Submission settings
  allow_multiple_submissions BOOLEAN NOT NULL DEFAULT TRUE,
  require_authentication BOOLEAN NOT NULL DEFAULT FALSE,
  max_submissions INTEGER, -- NULL = unlimited
  submission_deadline TIMESTAMPTZ,

  -- Notifications
  notify_on_submission BOOLEAN NOT NULL DEFAULT FALSE,
  notification_emails TEXT[], -- Array of email addresses

  -- Redirect
  success_message TEXT,
  redirect_url TEXT, -- URL to redirect after submission

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT forms_name_nonempty CHECK (length(btrim(name)) > 0),
  CONSTRAINT forms_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT forms_title_nonempty CHECK (length(btrim(title)) > 0),
  CONSTRAINT forms_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL),
  CONSTRAINT forms_max_submissions_positive CHECK (max_submissions IS NULL OR max_submissions > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS forms_slug_unique ON public.forms (slug);
CREATE INDEX IF NOT EXISTS forms_owner_idx ON public.forms (owner_id);
CREATE INDEX IF NOT EXISTS forms_published_idx ON public.forms (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS forms_active_idx ON public.forms (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_forms_updated_at ON public.forms;
CREATE TRIGGER set_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Form Fields
-- =========================
CREATE TABLE IF NOT EXISTS public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,

  -- Field definition
  field_name TEXT NOT NULL, -- Internal name (e.g., 'email', 'message')
  field_label TEXT NOT NULL, -- Display label
  field_type TEXT NOT NULL, -- 'text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'file', etc.
  placeholder TEXT,
  help_text TEXT,

  -- Validation
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  min_length INTEGER,
  max_length INTEGER,
  pattern TEXT, -- Regex pattern
  validation_message TEXT, -- Custom error message

  -- Options (for select, radio, checkbox groups)
  options JSONB, -- Array of {label, value} objects

  -- Display
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT form_fields_field_name_nonempty CHECK (length(btrim(field_name)) > 0),
  CONSTRAINT form_fields_field_label_nonempty CHECK (length(btrim(field_label)) > 0),
  CONSTRAINT form_fields_field_type_valid CHECK (
    field_type IN (
      'text', 'email', 'tel', 'url', 'number', 'date', 'time', 'datetime-local',
      'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'file', 'hidden'
    )
  ),
  CONSTRAINT form_fields_length_positive CHECK (
    (min_length IS NULL OR min_length >= 0) AND
    (max_length IS NULL OR max_length >= 0) AND
    (max_length IS NULL OR min_length IS NULL OR max_length >= min_length)
  )
);

CREATE INDEX IF NOT EXISTS form_fields_form_idx ON public.form_fields (form_id);
CREATE INDEX IF NOT EXISTS form_fields_order_idx ON public.form_fields (form_id, order_index);
CREATE INDEX IF NOT EXISTS form_fields_active_idx ON public.form_fields (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_form_fields_updated_at ON public.form_fields;
CREATE TRIGGER set_form_fields_updated_at
BEFORE UPDATE ON public.form_fields
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Form Submissions
-- =========================
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous

  -- Submission data
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Field values: {field_name: value}

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'archived', 'spam'
  is_read BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT form_submissions_status_valid CHECK (
    status IN ('pending', 'reviewed', 'archived', 'spam')
  )
);

CREATE INDEX IF NOT EXISTS form_submissions_form_idx ON public.form_submissions (form_id);
CREATE INDEX IF NOT EXISTS form_submissions_user_idx ON public.form_submissions (user_id);
CREATE INDEX IF NOT EXISTS form_submissions_status_idx ON public.form_submissions (status);
CREATE INDEX IF NOT EXISTS form_submissions_submitted_at_idx ON public.form_submissions (submitted_at DESC);
CREATE INDEX IF NOT EXISTS form_submissions_read_idx ON public.form_submissions (is_read) WHERE is_read = FALSE;

DROP TRIGGER IF EXISTS set_form_submissions_updated_at ON public.form_submissions;
CREATE TRIGGER set_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Public: read only published, active forms
DROP POLICY IF EXISTS "forms_select_published" ON public.forms;
CREATE POLICY "forms_select_published"
ON public.forms
FOR SELECT
USING (is_published = TRUE AND is_active = TRUE);

-- Owners: can read all their own forms (including unpublished)
DROP POLICY IF EXISTS "forms_select_own" ON public.forms;
CREATE POLICY "forms_select_own"
ON public.forms
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners: manage their own forms
DROP POLICY IF EXISTS "forms_insert_own" ON public.forms;
CREATE POLICY "forms_insert_own"
ON public.forms
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "forms_update_own" ON public.forms;
CREATE POLICY "forms_update_own"
ON public.forms
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "forms_delete_own" ON public.forms;
CREATE POLICY "forms_delete_own"
ON public.forms
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Form fields: public can read fields for published forms
DROP POLICY IF EXISTS "form_fields_select_published" ON public.form_fields;
CREATE POLICY "form_fields_select_published"
ON public.form_fields
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id
      AND f.is_published = TRUE
      AND f.is_active = TRUE
  )
  AND form_fields.is_active = TRUE
);

-- Owners: can read all fields for their own forms
DROP POLICY IF EXISTS "form_fields_select_own" ON public.form_fields;
CREATE POLICY "form_fields_select_own"
ON public.form_fields
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id AND f.owner_id = auth.uid()
  )
);

-- Owners: manage fields for their own forms
DROP POLICY IF EXISTS "form_fields_insert_own" ON public.form_fields;
CREATE POLICY "form_fields_insert_own"
ON public.form_fields
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id AND f.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "form_fields_update_own" ON public.form_fields;
CREATE POLICY "form_fields_update_own"
ON public.form_fields
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id AND f.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id AND f.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "form_fields_delete_own" ON public.form_fields;
CREATE POLICY "form_fields_delete_own"
ON public.form_fields
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_fields.form_id AND f.owner_id = auth.uid()
  )
);

-- Submissions: public can submit to published forms (if allowed)
DROP POLICY IF EXISTS "form_submissions_insert_public" ON public.form_submissions;
CREATE POLICY "form_submissions_insert_public"
ON public.form_submissions
FOR INSERT
TO authenticated, anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_submissions.form_id
      AND f.is_published = TRUE
      AND f.is_active = TRUE
      AND (NOT f.require_authentication OR form_submissions.user_id = auth.uid())
      AND (f.submission_deadline IS NULL OR f.submission_deadline > NOW())
      AND (
        f.allow_multiple_submissions = TRUE OR
        NOT EXISTS (
          SELECT 1 FROM public.form_submissions fs
          WHERE fs.form_id = f.id
            AND fs.user_id = form_submissions.user_id
        )
      )
      AND (
        f.max_submissions IS NULL OR
        (SELECT COUNT(*) FROM public.form_submissions fs WHERE fs.form_id = f.id) < f.max_submissions
      )
  )
);

-- Users: can read their own submissions
DROP POLICY IF EXISTS "form_submissions_select_own" ON public.form_submissions;
CREATE POLICY "form_submissions_select_own"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Owners: can read all submissions for their own forms
DROP POLICY IF EXISTS "form_submissions_select_own_forms" ON public.form_submissions;
CREATE POLICY "form_submissions_select_own_forms"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
  )
);

-- Owners: can update/delete submissions for their own forms
DROP POLICY IF EXISTS "form_submissions_update_own_forms" ON public.form_submissions;
CREATE POLICY "form_submissions_update_own_forms"
ON public.form_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "form_submissions_delete_own_forms" ON public.form_submissions;
CREATE POLICY "form_submissions_delete_own_forms"
ON public.form_submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
  )
);

-- Convenience view: form submissions count per form
CREATE OR REPLACE VIEW public.form_submissions_count AS
SELECT
  f.id AS form_id,
  f.name AS form_name,
  COUNT(s.id)::bigint AS submission_count,
  COUNT(CASE WHEN s.status = 'pending' THEN 1 END)::bigint AS pending_count,
  COUNT(CASE WHEN s.is_read = FALSE THEN 1 END)::bigint AS unread_count
FROM public.forms f
LEFT JOIN public.form_submissions s ON s.form_id = f.id
GROUP BY f.id, f.name;

COMMENT ON TABLE public.forms IS 'Form definitions.';
COMMENT ON TABLE public.form_fields IS 'Form field definitions.';
COMMENT ON TABLE public.form_submissions IS 'Form submissions.';
COMMENT ON VIEW public.form_submissions_count IS 'Aggregated submission counts per form.';
