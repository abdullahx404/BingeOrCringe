'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

/** Toggle the user's collection visibility (public / private) */
export async function toggleVisibility(isPublic: boolean): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not signed in.' };

  const { error } = await supabase
    .from('profiles')
    .update({ is_public: isPublic })
    .eq('id', user.id);

  if (error) return { data: null, error: error.message };

  revalidatePath('/dashboard');
  return { data: null, error: null };
}
