import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for use in Client Components and browser context.
 * Only has access to public (anon) data within RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
