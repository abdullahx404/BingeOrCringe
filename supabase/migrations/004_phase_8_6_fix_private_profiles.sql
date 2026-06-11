-- Allow all users to read profile metadata so they can see the "Private" status correctly
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

CREATE POLICY "profiles_public_read"
    ON public.profiles FOR SELECT
    USING (true);
