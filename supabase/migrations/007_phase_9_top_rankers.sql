-- Phase 9: Top Rankers View

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
