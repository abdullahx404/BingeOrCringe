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
