-- Update the rankings read policy to allow viewing rankings if they are part of a public custom list
DROP POLICY IF EXISTS "rankings_public_read" ON public.rankings;

CREATE POLICY "rankings_public_read"
  ON public.rankings FOR SELECT
  USING (
    -- The ranking owner's profile is public
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = rankings.user_id AND p.is_public = true
    )
    -- OR it's the current user's ranking
    OR auth.uid() = user_id
    -- OR the ranking is included in at least one public list
    OR EXISTS (
      SELECT 1 FROM public.list_items li
      JOIN public.lists l ON l.id = li.list_id
      WHERE li.ranking_id = rankings.id AND l.is_public = true
    )
  );
