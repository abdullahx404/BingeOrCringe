'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  is_public: boolean;
}

export async function updateProfile(data: ProfileUpdateData): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  const usernameRegex = /^[a-z0-9._]{3,20}$/;
  if (!usernameRegex.test(data.username)) {
    return { data: null, error: 'Username must be 3-20 characters long and can only contain lowercase letters, numbers, dots, and underscores.' };
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

  // Get old username to check if it changed
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const oldUsername = oldProfile?.username;

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.display_name,
      username: data.username,
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { data: null, error: 'Failed to update profile: ' + error.message };

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  revalidatePath(`/u/${data.username}`);
  
  if (oldUsername && oldUsername !== data.username) {
    redirect(`/u/${data.username}`);
  }

  return { data: null, error: null };
}

export async function deleteAccount(): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    // 1. Delete user from Supabase Auth via Admin API
    // This will trigger ON DELETE CASCADE in the database, erasing all data associated with this user ID
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Account deletion error:', deleteError);
      return { data: null, error: 'Failed to delete account. Please try again later.' };
    }

    // 2. Sign the user out from the current session
    await supabase.auth.signOut();

    // Revalidate global paths
    revalidatePath('/', 'layout');
    
    return { data: null, error: null };
  } catch (err: any) {
    console.error('Account deletion exception:', err);
    return { data: null, error: err.message || 'An unexpected error occurred during account deletion.' };
  }
}
