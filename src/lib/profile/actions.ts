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

export interface ProfileUpdateData {
  display_name: string;
  username: string;
  avatar_url: string | null;
  is_public: boolean;
}

export async function updateProfile(data: ProfileUpdateData): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(data.username)) {
    return { data: null, error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' };
  }

  // Check if username is taken by someone else
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', data.username)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return { data: null, error: 'Error validating username uniqueness.' };
  }

  if (existingUser && existingUser.id !== user.id) {
    return { data: null, error: 'Username is already taken.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.display_name,
      username: data.username,
      avatar_url: data.avatar_url || null,
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { data: null, error: 'Failed to update profile: ' + error.message };

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  revalidatePath(`/u/${data.username}`);
  
  return { data: null, error: null };
}
