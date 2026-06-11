'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isValidTier } from '@/lib/utils/tiers';
import { sanitizeTags } from '@/lib/utils/tags';
import type { ApiResponse } from '@/types';

/* ─── Create Ranking ─────────────────────────────────── */
export async function createRanking(formData: FormData): Promise<ApiResponse<any>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  const tmdb_id = parseInt(formData.get('tmdb_id') as string);
  const media_type = formData.get('media_type') as string;
  const title = (formData.get('title') as string ?? '').trim();
  const tier = formData.get('tier') as string;
  const poster_path = (formData.get('poster_path') as string) || null;
  const year = (formData.get('year') as string) || null;
  const season_number = formData.get('season_number')
    ? parseInt(formData.get('season_number') as string)
    : null;
  const episode_number = formData.get('episode_number')
    ? parseInt(formData.get('episode_number') as string)
    : null;

  let tags: string[] = [];
  try {
    const raw = formData.get('tags') as string;
    tags = sanitizeTags(JSON.parse(raw)).slice(0, 3); // hard cap: max 3 tags
  } catch { /* empty tags */ }

  if (!isValidTier(tier)) return { data: null, error: 'Invalid tier.' };
  if (!title) return { data: null, error: 'Title is required.' };
  if (isNaN(tmdb_id)) return { data: null, error: 'Invalid TMDB ID.' };

  // Upsert — if they rank again, update instead of error
  const { data: insertedData, error } = await supabase
    .from('rankings')
    .upsert({
      user_id: user.id,
      tmdb_id,
      media_type,
      title,
      tier,
      tags,
      poster_path,
      year,
      season_number,
      episode_number,
    }, {
      onConflict: 'user_id,tmdb_id,media_type,season_number,episode_number',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/dashboard');
  return { data: insertedData, error: null };
}

/* ─── Update Ranking ────────────────────────────────── */
export async function updateRanking(
  id: string,
  formData: FormData
): Promise<ApiResponse<any>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not signed in.' };

  const tier = formData.get('tier') as string;
  if (!isValidTier(tier)) return { data: null, error: 'Invalid tier.' };

  let tags: string[] = [];
  try {
    tags = sanitizeTags(JSON.parse(formData.get('tags') as string)).slice(0, 3);
  } catch { /* empty */ }

  const { data: updatedData, error } = await supabase
    .from('rankings')
    .update({ tier, tags })
    .eq('id', id)
    .eq('user_id', user.id) // RLS + safety check
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/dashboard');
  return { data: updatedData, error: null };
}

/* ─── Delete Ranking ────────────────────────────────── */
export async function deleteRanking(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not signed in.' };

  const { error } = await supabase
    .from('rankings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { data: null, error: error.message };

  revalidatePath('/dashboard');
  return { data: null, error: null };
}

/* ─── Get User's Ranking for a specific title ────── */
export async function getUserRanking(
  tmdbId: number,
  mediaType: string,
  seasonNumber?: number | null,
  episodeNumber?: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from('rankings')
    .select('*')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType);

  if (seasonNumber != null) {
    query = query.eq('season_number', seasonNumber);
  } else {
    query = query.is('season_number', null);
  }

  if (episodeNumber != null) {
    query = query.eq('episode_number', episodeNumber);
  } else {
    query = query.is('episode_number', null);
  }

  const { data } = await query.single();
  return data;
}
