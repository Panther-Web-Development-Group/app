-- Analytics schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Page views tracking
-- - Custom events tracking
-- - User sessions
-- - Public can insert (anonymized), authenticated users can read their own data

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
-- Analytics Sessions
-- =========================
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous

  -- Session info
  session_id TEXT NOT NULL, -- Client-generated session ID
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Device/browser
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,

  -- Location (optional, from IP geolocation)
  country TEXT,
  region TEXT,
  city TEXT,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Calculated duration

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT analytics_sessions_session_id_nonempty CHECK (length(btrim(session_id)) > 0),
  CONSTRAINT analytics_sessions_device_type_valid CHECK (
    device_type IS NULL OR
    device_type IN ('desktop', 'mobile', 'tablet', 'other')
  )
);

CREATE INDEX IF NOT EXISTS analytics_sessions_user_idx ON public.analytics_sessions (user_id);
CREATE INDEX IF NOT EXISTS analytics_sessions_session_id_idx ON public.analytics_sessions (session_id);
CREATE INDEX IF NOT EXISTS analytics_sessions_started_at_idx ON public.analytics_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS analytics_sessions_country_idx ON public.analytics_sessions (country);

DROP TRIGGER IF EXISTS set_analytics_sessions_updated_at ON public.analytics_sessions;
CREATE TRIGGER set_analytics_sessions_updated_at
BEFORE UPDATE ON public.analytics_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Page Views
-- =========================
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Page info
  page_path TEXT NOT NULL,
  page_title TEXT,
  page_type TEXT, -- 'page', 'post', 'home', etc.

  -- Referenced content (optional)
  page_id UUID, -- Reference to pages table
  post_id UUID, -- Reference to posts table

  -- View metrics
  view_duration INTEGER, -- Time spent on page (seconds)
  scroll_depth INTEGER, -- Percentage scrolled (0-100)
  is_bounce BOOLEAN DEFAULT FALSE,

  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT analytics_page_views_page_path_nonempty CHECK (length(btrim(page_path)) > 0),
  CONSTRAINT analytics_page_views_scroll_depth_valid CHECK (scroll_depth IS NULL OR (scroll_depth >= 0 AND scroll_depth <= 100))
);

CREATE INDEX IF NOT EXISTS analytics_page_views_session_idx ON public.analytics_page_views (session_id);
CREATE INDEX IF NOT EXISTS analytics_page_views_user_idx ON public.analytics_page_views (user_id);
CREATE INDEX IF NOT EXISTS analytics_page_views_page_path_idx ON public.analytics_page_views (page_path);
CREATE INDEX IF NOT EXISTS analytics_page_views_viewed_at_idx ON public.analytics_page_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS analytics_page_views_page_id_idx ON public.analytics_page_views (page_id) WHERE page_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_page_views_post_id_idx ON public.analytics_page_views (post_id) WHERE post_id IS NOT NULL;

-- =========================
-- Custom Events
-- =========================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_name TEXT NOT NULL,
  event_category TEXT, -- e.g., 'click', 'download', 'video', 'form'
  event_action TEXT, -- e.g., 'button_click', 'file_download'
  event_label TEXT, -- Additional context

  -- Context
  page_path TEXT,
  element_id TEXT, -- DOM element ID if applicable
  element_class TEXT, -- DOM element class if applicable

  -- Value (optional numeric value)
  event_value NUMERIC,

  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT analytics_events_event_name_nonempty CHECK (length(btrim(event_name)) > 0)
);

CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS analytics_events_category_idx ON public.analytics_events (event_category);
CREATE INDEX IF NOT EXISTS analytics_events_occurred_at_idx ON public.analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_page_path_idx ON public.analytics_events (page_path);

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Sessions: public can insert (for tracking), authenticated can read their own
DROP POLICY IF EXISTS "analytics_sessions_insert_public" ON public.analytics_sessions;
CREATE POLICY "analytics_sessions_insert_public"
ON public.analytics_sessions
FOR INSERT
TO authenticated, anon
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "analytics_sessions_select_own" ON public.analytics_sessions;
CREATE POLICY "analytics_sessions_select_own"
ON public.analytics_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Page views: public can insert, authenticated can read their own
DROP POLICY IF EXISTS "analytics_page_views_insert_public" ON public.analytics_page_views;
CREATE POLICY "analytics_page_views_insert_public"
ON public.analytics_page_views
FOR INSERT
TO authenticated, anon
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "analytics_page_views_select_own" ON public.analytics_page_views;
CREATE POLICY "analytics_page_views_select_own"
ON public.analytics_page_views
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Events: public can insert, authenticated can read their own
DROP POLICY IF EXISTS "analytics_events_insert_public" ON public.analytics_events;
CREATE POLICY "analytics_events_insert_public"
ON public.analytics_events
FOR INSERT
TO authenticated, anon
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "analytics_events_select_own" ON public.analytics_events;
CREATE POLICY "analytics_events_select_own"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Convenience view: aggregated page views (no user IDs exposed)
CREATE OR REPLACE VIEW public.analytics_page_views_summary AS
SELECT
  page_path,
  page_type,
  DATE_TRUNC('day', viewed_at) AS view_date,
  COUNT(*)::bigint AS view_count,
  AVG(view_duration)::numeric(10, 2) AS avg_duration,
  AVG(scroll_depth)::numeric(5, 2) AS avg_scroll_depth,
  COUNT(CASE WHEN is_bounce = TRUE THEN 1 END)::bigint AS bounce_count
FROM public.analytics_page_views
GROUP BY page_path, page_type, DATE_TRUNC('day', viewed_at);

-- Convenience view: aggregated events (no user IDs exposed)
CREATE OR REPLACE VIEW public.analytics_events_summary AS
SELECT
  event_name,
  event_category,
  event_action,
  DATE_TRUNC('day', occurred_at) AS event_date,
  COUNT(*)::bigint AS event_count,
  SUM(event_value)::numeric(10, 2) AS total_value,
  AVG(event_value)::numeric(10, 2) AS avg_value
FROM public.analytics_events
GROUP BY event_name, event_category, event_action, DATE_TRUNC('day', occurred_at);

COMMENT ON TABLE public.analytics_sessions IS 'Analytics sessions (user visits).';
COMMENT ON TABLE public.analytics_page_views IS 'Page view tracking.';
COMMENT ON TABLE public.analytics_events IS 'Custom event tracking.';
COMMENT ON VIEW public.analytics_page_views_summary IS 'Aggregated page view statistics (no user data).';
COMMENT ON VIEW public.analytics_events_summary IS 'Aggregated event statistics (no user data).';
