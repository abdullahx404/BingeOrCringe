-- ============================================================
-- BingeOrCringe - Database Migration 001
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Profiles Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url   text,
  bio          text CHECK (char_length(bio) <= 280),
  is_public    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Rankings Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rankings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tmdb_id        integer NOT NULL,
  media_type     text NOT NULL CHECK (media_type IN ('movie', 'tv', 'season', 'episode')),
  season_number  integer,
  episode_number integer,
  tier           text NOT NULL CHECK (tier IN ('goated', 'binge', 'mid', 'cringe', 'trash')),
  tags           text[] NOT NULL DEFAULT '{}',
  title          text NOT NULL,
  poster_path    text,
  year           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  -- One ranking per user per unique title (movie / show / season / episode)
  UNIQUE (user_id, tmdb_id, media_type, season_number, episode_number)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_rankings_user_id    ON public.rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_tmdb_id    ON public.rankings(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_rankings_tier       ON public.rankings(tier);
CREATE INDEX IF NOT EXISTS idx_rankings_user_tier  ON public.rankings(user_id, tier);
CREATE INDEX IF NOT EXISTS idx_profiles_username   ON public.profiles(username);

-- ── Updated-at trigger helper ────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER rankings_updated_at
  BEFORE UPDATE ON public.rankings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "profiles_own_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Rankings: public read (from public profiles), own write
CREATE POLICY "rankings_public_read"
  ON public.rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = rankings.user_id AND (p.is_public = true OR auth.uid() = p.id)
    )
  );

CREATE POLICY "rankings_own_insert"
  ON public.rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rankings_own_update"
  ON public.rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "rankings_own_delete"
  ON public.rankings FOR DELETE
  USING (auth.uid() = user_id);
