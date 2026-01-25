-- User Profiles schema + Supabase RLS policies (“rules”)
-- Supports:
-- - Extended user data beyond auth.users
-- - Bio, avatar, social links, preferences
-- - Public read basic info, users manage their own

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reuse shared updated_at trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT, -- URL to avatar image

  -- Contact (optional, privacy-controlled)
  email_public BOOLEAN NOT NULL DEFAULT FALSE,
  website TEXT,
  location TEXT,

  -- Social links (stored as JSONB for flexibility)
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"github": "url", "twitter": "url"}

  -- Preferences
  timezone TEXT,
  locale TEXT DEFAULT 'en-US',

  -- Privacy settings
  profile_public BOOLEAN NOT NULL DEFAULT TRUE,
  show_email BOOLEAN NOT NULL DEFAULT FALSE,
  show_location BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_profiles_display_name_len CHECK (display_name IS NULL OR length(display_name) <= 100),
  CONSTRAINT user_profiles_bio_len CHECK (bio IS NULL OR length(bio) <= 2000),
  CONSTRAINT user_profiles_website_url CHECK (
    website IS NULL OR
    website ~ '^https?://' OR
    website = ''
  )
);

CREATE INDEX IF NOT EXISTS user_profiles_user_idx ON public.user_profiles (user_id);
CREATE INDEX IF NOT EXISTS user_profiles_public_idx ON public.user_profiles (profile_public) WHERE profile_public = TRUE;
CREATE INDEX IF NOT EXISTS user_profiles_display_name_idx ON public.user_profiles (display_name);

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RLS policies (“rules”)
-- =========================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Public: read only public profiles (basic info only)
DROP POLICY IF EXISTS "user_profiles_select_public" ON public.user_profiles;
CREATE POLICY "user_profiles_select_public"
ON public.user_profiles
FOR SELECT
USING (profile_public = TRUE);

-- Users: can read their own profile (full access)
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users: manage their own profile
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
CREATE POLICY "user_profiles_delete_own"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Convenience view: public profile info (safe for display)
CREATE OR REPLACE VIEW public.public_user_profiles AS
SELECT
  up.id,
  up.user_id,
  up.display_name,
  up.first_name,
  up.last_name,
  up.bio,
  up.avatar_url,
  CASE WHEN up.show_email THEN au.email ELSE NULL END AS email,
  up.website,
  CASE WHEN up.show_location THEN up.location ELSE NULL END AS location,
  up.social_links,
  up.created_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE up.profile_public = TRUE;

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles beyond auth.users.';
COMMENT ON VIEW public.public_user_profiles IS 'Public-facing view of user profiles (respects privacy settings).';
