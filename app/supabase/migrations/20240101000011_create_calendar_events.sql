-- Calendar Events schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Events with start/end times, location, description
-- - Recurring events (daily, weekly, monthly, yearly)
-- - Event categories/types
-- - RSVPs/attendees
-- - Public read published events, authenticated users manage their own

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
-- Event Categories
-- =========================
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Optional hex color for UI
  icon TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_categories_name_nonempty CHECK (length(btrim(name)) > 0),
  CONSTRAINT event_categories_slug_nonempty CHECK (length(btrim(slug)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS event_categories_slug_unique ON public.event_categories (slug);
CREATE INDEX IF NOT EXISTS event_categories_owner_idx ON public.event_categories (owner_id);
CREATE INDEX IF NOT EXISTS event_categories_active_idx ON public.event_categories (is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS set_event_categories_updated_at ON public.event_categories;
CREATE TRIGGER set_event_categories_updated_at
BEFORE UPDATE ON public.event_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Events
-- =========================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT, -- For previews

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  all_day BOOLEAN NOT NULL DEFAULT FALSE,

  -- Location
  location_name TEXT,
  location_address TEXT,
  location_url TEXT, -- Google Maps or other map link
  latitude NUMERIC(10, 8), -- Decimal degrees (e.g., 40.7128)
  longitude NUMERIC(11, 8), -- Decimal degrees (e.g., -74.0060)
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  virtual_url TEXT, -- Zoom, Teams, etc.

  -- Organization
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  featured_image TEXT, -- URL to featured image

  -- Recurrence
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  recurrence_interval INTEGER DEFAULT 1, -- Every N days/weeks/months
  recurrence_end_date TIMESTAMPTZ, -- When recurrence stops
  recurrence_count INTEGER, -- Number of occurrences (alternative to end_date)
  recurrence_days_of_week INTEGER[], -- For weekly: [1,3,5] = Mon, Wed, Fri
  recurrence_day_of_month INTEGER, -- For monthly: day 15
  recurrence_week_of_month INTEGER, -- For monthly: 1st, 2nd, 3rd, 4th, last week
  recurrence_month_of_year INTEGER[], -- For yearly: [1,6] = Jan, Jun

  -- Status
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- RSVP
  rsvp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rsvp_limit INTEGER, -- Max attendees (NULL = unlimited)
  rsvp_deadline TIMESTAMPTZ, -- When RSVPs close

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT events_title_nonempty CHECK (length(btrim(title)) > 0),
  CONSTRAINT events_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT events_end_after_start CHECK (end_time IS NULL OR end_time >= start_time),
  CONSTRAINT events_published_requires_timestamp CHECK (NOT is_published OR published_at IS NOT NULL),
  CONSTRAINT events_recurrence_pattern_valid CHECK (
    recurrence_pattern IS NULL OR
    recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')
  ),
  CONSTRAINT events_recurrence_interval_positive CHECK (recurrence_interval IS NULL OR recurrence_interval > 0),
  CONSTRAINT events_rsvp_limit_positive CHECK (rsvp_limit IS NULL OR rsvp_limit > 0),
  CONSTRAINT events_virtual_url_check CHECK (NOT is_virtual OR virtual_url IS NOT NULL),
  CONSTRAINT events_latitude_valid CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  CONSTRAINT events_longitude_valid CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  CONSTRAINT events_coordinates_both_or_neither CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON public.events (slug);
CREATE INDEX IF NOT EXISTS events_owner_idx ON public.events (owner_id);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events (category_id);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events (start_time);
CREATE INDEX IF NOT EXISTS events_published_idx ON public.events (is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS events_featured_idx ON public.events (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS events_recurring_idx ON public.events (is_recurring) WHERE is_recurring = TRUE;

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Event RSVPs/Attendees
-- =========================
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'going', -- 'going', 'maybe', 'not_going'
  notes TEXT, -- Optional message from attendee

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_rsvps_unique_user_per_event UNIQUE (event_id, user_id),
  CONSTRAINT event_rsvps_status_valid CHECK (status IN ('going', 'maybe', 'not_going'))
);

CREATE INDEX IF NOT EXISTS event_rsvps_event_idx ON public.event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS event_rsvps_user_idx ON public.event_rsvps (user_id);
CREATE INDEX IF NOT EXISTS event_rsvps_status_idx ON public.event_rsvps (status);

DROP TRIGGER IF EXISTS set_event_rsvps_updated_at ON public.event_rsvps;
CREATE TRIGGER set_event_rsvps_updated_at
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Public: read only active categories
DROP POLICY IF EXISTS "event_categories_select_active" ON public.event_categories;
CREATE POLICY "event_categories_select_active"
ON public.event_categories
FOR SELECT
USING (is_active = TRUE);

-- Owners manage their own categories
DROP POLICY IF EXISTS "event_categories_insert_own" ON public.event_categories;
CREATE POLICY "event_categories_insert_own"
ON public.event_categories
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "event_categories_update_own" ON public.event_categories;
CREATE POLICY "event_categories_update_own"
ON public.event_categories
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "event_categories_delete_own" ON public.event_categories;
CREATE POLICY "event_categories_delete_own"
ON public.event_categories
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Public: read only published events
DROP POLICY IF EXISTS "events_select_published" ON public.events;
CREATE POLICY "events_select_published"
ON public.events
FOR SELECT
USING (is_published = TRUE);

-- Owners: can read all their own events (including unpublished)
DROP POLICY IF EXISTS "events_select_own" ON public.events;
CREATE POLICY "events_select_own"
ON public.events
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners: manage their own events
DROP POLICY IF EXISTS "events_insert_own" ON public.events;
CREATE POLICY "events_insert_own"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "events_update_own" ON public.events;
CREATE POLICY "events_update_own"
ON public.events
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "events_delete_own" ON public.events;
CREATE POLICY "events_delete_own"
ON public.events
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- RSVPs: public can read RSVPs for published events (for attendee counts)
DROP POLICY IF EXISTS "event_rsvps_select_public" ON public.event_rsvps;
CREATE POLICY "event_rsvps_select_public"
ON public.event_rsvps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_rsvps.event_id AND e.is_published = TRUE
  )
);

-- Users: can read their own RSVPs
DROP POLICY IF EXISTS "event_rsvps_select_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_select_own"
ON public.event_rsvps
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users: can RSVP to published events (if RSVP enabled and not past deadline)
DROP POLICY IF EXISTS "event_rsvps_insert_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_insert_own"
ON public.event_rsvps
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_rsvps.event_id
      AND e.is_published = TRUE
      AND e.rsvp_enabled = TRUE
      AND (e.rsvp_deadline IS NULL OR e.rsvp_deadline > NOW())
  )
);

-- Users: can update their own RSVPs
DROP POLICY IF EXISTS "event_rsvps_update_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_update_own"
ON public.event_rsvps
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users: can cancel their own RSVPs
DROP POLICY IF EXISTS "event_rsvps_delete_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_delete_own"
ON public.event_rsvps
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Convenience view: published events with RSVP counts
CREATE OR REPLACE VIEW public.published_events_with_rsvps AS
SELECT
  e.id,
  e.owner_id,
  e.title,
  e.slug,
  e.description,
  e.short_description,
  e.start_time,
  e.end_time,
  e.timezone,
  e.all_day,
  e.location_name,
  e.location_address,
  e.location_url,
  e.latitude,
  e.longitude,
  e.is_virtual,
  e.virtual_url,
  e.category_id,
  e.featured_image,
  e.is_recurring,
  e.recurrence_pattern,
  e.is_featured,
  e.rsvp_enabled,
  e.rsvp_limit,
  e.rsvp_deadline,
  e.metadata,
  e.created_at,
  e.updated_at,
  COUNT(CASE WHEN r.status = 'going' THEN 1 END)::int AS rsvp_going_count,
  COUNT(CASE WHEN r.status = 'maybe' THEN 1 END)::int AS rsvp_maybe_count,
  COUNT(CASE WHEN r.status = 'not_going' THEN 1 END)::int AS rsvp_not_going_count,
  COUNT(r.id)::int AS rsvp_total_count
FROM public.events e
LEFT JOIN public.event_rsvps r ON r.event_id = e.id
WHERE e.is_published = TRUE
GROUP BY e.id;

-- Convenience view: upcoming events
CREATE OR REPLACE VIEW public.upcoming_events AS
SELECT *
FROM public.published_events_with_rsvps
WHERE start_time >= NOW()
ORDER BY start_time ASC;

COMMENT ON TABLE public.event_categories IS 'Event categories/types.';
COMMENT ON TABLE public.events IS 'Calendar events with recurrence support.';
COMMENT ON TABLE public.event_rsvps IS 'Event RSVPs/attendees.';
COMMENT ON VIEW public.published_events_with_rsvps IS 'Published events with aggregated RSVP counts.';
COMMENT ON VIEW public.upcoming_events IS 'Upcoming published events (sorted by start time).';
