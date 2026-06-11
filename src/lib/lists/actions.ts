'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, CustomList } from '@/types';

export async function getLists(): Promise<ApiResponse<CustomList[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated.' };

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: 'Failed to load lists.' };
  }

  return { data: data as CustomList[], error: null };
}

export async function createList(formData: FormData): Promise<ApiResponse<CustomList>> {
  const name = (formData.get('name') as string)?.trim();
  const is_public = formData.get('is_public') === 'true';

  if (!name || name.length > 50) {
    return { data: null, error: 'List name must be between 1 and 50 characters.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Not authenticated.' };
  }

  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: user.id, name, is_public })
    .select()
    .single();

  if (error) {
    return { data: null, error: 'Failed to create list.' };
  }

  revalidatePath('/dashboard');
  return { data: data as CustomList, error: null };
}

export async function deleteList(listId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', user.id);

  if (error) {
    return { data: null, error: 'Failed to delete list.' };
  }

  revalidatePath('/dashboard');
  return { data: null, error: null };
}

export async function updateList(listId: string, formData: FormData): Promise<ApiResponse<CustomList>> {
  const name = (formData.get('name') as string)?.trim();
  const is_public = formData.get('is_public') === 'true';

  if (!name || name.length > 50) {
    return { data: null, error: 'List name must be between 1 and 50 characters.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated.' };

  const { data, error } = await supabase
    .from('lists')
    .update({ name, is_public })
    .eq('id', listId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: 'Failed to update list.' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/list/${listId}`);
  return { data: data as CustomList, error: null };
}

export async function addToList(listId: string, rankingId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated.' };

  // Note: RLS ensures user can only add to their own list
  const { error } = await supabase
    .from('list_items')
    .insert({ list_id: listId, ranking_id: rankingId });

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'Title is already in this list.' };
    }
    return { data: null, error: 'Failed to add to list.' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/list/${listId}`);
  return { data: null, error: null };
}

export async function removeFromList(listId: string, rankingId: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('ranking_id', rankingId);

  if (error) {
    return { data: null, error: 'Failed to remove from list.' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/list/${listId}`);
  return { data: null, error: null };
}
