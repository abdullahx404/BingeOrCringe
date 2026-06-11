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
