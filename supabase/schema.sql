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

-- 1. Create the `lists` table
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 50),
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create the `list_items` table
CREATE TABLE list_items (
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
    ranking_id UUID REFERENCES rankings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (list_id, ranking_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for `lists`
CREATE POLICY "Public lists are viewable by everyone" ON lists
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own lists" ON lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists" ON lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON lists
    FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for `list_items`
CREATE POLICY "Items in public lists are viewable by everyone" ON list_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.is_public = true)
    );

CREATE POLICY "Users can view items in their own lists" ON list_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid())
    );

CREATE POLICY "Users can manage items in their own lists" ON list_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid())
    );

-- Phase 8.6: Follows and Notifications tables
-- 1. Create Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);
-- Index for fast queries
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
-- Enable RLS on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
-- Policies for follows
CREATE POLICY "Anyone can view follows" 
    ON public.follows FOR SELECT 
    USING (true);
CREATE POLICY "Users can follow others" 
    ON public.follows FOR INSERT 
    WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" 
    ON public.follows FOR DELETE 
    USING (auth.uid() = follower_id);
-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- the receiver
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- the person who followed
    type TEXT NOT NULL CHECK (type IN ('follow')),
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Index for notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Policies for notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Actors can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);
-- Prevent users from following themselves
ALTER TABLE public.follows ADD CONSTRAINT cannot_follow_self CHECK (follower_id != following_id);

-- Profile Private/Public
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

CREATE POLICY "profiles_public_read"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "rankings_public_read" ON public.rankings;

CREATE POLICY "rankings_public_read"
  ON public.rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = rankings.user_id AND p.is_public = true
    )
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.list_items li
      JOIN public.lists l ON l.id = li.list_id
      WHERE li.ranking_id = rankings.id AND l.is_public = true
    )
  );


-- Phase 8.7: Real-Time Chat

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for quick fetching of chat history and unread counts
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages where they are the sender OR the receiver
CREATE POLICY "Users can read their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only send messages as themselves
CREATE POLICY "Users can insert their own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read if they are the receiver
CREATE POLICY "Receivers can update is_read"
    ON public.messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Enable realtime for this table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;


-- Create a view that calculates the top 5 rankers with public profiles
CREATE OR REPLACE VIEW public.top_rankers AS
SELECT 
  p.id, 
  p.username, 
  p.display_name, 
  p.avatar_url, 
  COUNT(r.id) as total_rankings
FROM public.profiles p
JOIN public.rankings r ON r.user_id = p.id
WHERE p.is_public = true
GROUP BY p.id
ORDER BY total_rankings DESC
LIMIT 5;

-- Grant access to authenticated and anonymous users
GRANT SELECT ON public.top_rankers TO authenticated, anon;

-- Phase 9: Top Rankers View (Updated to include private profiles)

DROP VIEW IF EXISTS public.top_rankers;

-- Create a view that calculates the top 5 rankers (all profiles)
CREATE OR REPLACE VIEW public.top_rankers AS
SELECT 
  p.id, 
  p.username, 
  p.display_name, 
  p.avatar_url, 
  COUNT(r.id) as total_rankings
FROM public.profiles p
JOIN public.rankings r ON r.user_id = p.id
GROUP BY p.id
ORDER BY total_rankings DESC
LIMIT 5;

-- Grant access to authenticated and anonymous users
GRANT SELECT ON public.top_rankers TO authenticated, anon;



-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;





-- Phase 10: Top Rankers Function (Bypass RLS)

-- Create a SECURITY DEFINER function to calculate top rankers
-- This bypasses RLS on the rankings table so that private profiles are also counted.
CREATE OR REPLACE FUNCTION public.get_top_rankers()
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  total_rankings bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id, 
    p.username, 
    p.display_name, 
    p.avatar_url, 
    COUNT(r.id) as total_rankings
  FROM public.profiles p
  JOIN public.rankings r ON r.user_id = p.id
  GROUP BY p.id
  ORDER BY total_rankings DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_rankers() TO authenticated, anon;


CREATE OR REPLACE FUNCTION get_user_total_rankings(p_user_id uuid) 
RETURNS bigint 
LANGUAGE sql 
SECURITY DEFINER 
AS $$ 
  SELECT count(*) FROM public.rankings WHERE user_id = p_user_id; 
$$;


-- First, update any existing uppercase usernames to lowercase so the constraint doesn't fail
UPDATE public.profiles
SET username = LOWER(username)
WHERE username ~ '[A-Z]';

-- Then, add a strict constraint so the database physically rejects uppercase or special symbols
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check 
CHECK (username ~ '^[a-z0-9._]{3,20}$');






-- 1. Drop existing trigger to recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Update the function to only create profile when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Only proceed if this is an INSERT with confirmed email (like Google OAuth) 
  -- OR an UPDATE where email just became confirmed
  IF (TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
    
    -- Extract username or fallback to email prefix. Make sure it's lowercase to pass our check.
    base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    base_username := LOWER(REPLACE(base_username, ' ', '.'));
    
    final_username := base_username;

    -- Ensure uniqueness in case the username was taken while they were unverified
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      final_username := base_username || counter;
      counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (id, username, display_name, avatar_url, is_public)
    VALUES (
      NEW.id,
      final_username,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', final_username),
      NEW.raw_user_meta_data->>'avatar_url',
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger to fire on both INSERT and UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Delete existing profiles that belong to unverified users
DELETE FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email_confirmed_at IS NULL
);
