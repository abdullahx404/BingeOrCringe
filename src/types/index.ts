/**
 * Shared TypeScript types for BingeOrCringe
 */

import type { Tier } from '@/lib/utils/tiers';
import type { Tag } from '@/lib/utils/tags';

export type MediaType = 'movie' | 'tv' | 'season' | 'episode';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: MediaType;
  season_number: number | null;
  episode_number: number | null;
  tier: Tier;
  tags: Tag[];
  title: string;
  poster_path: string | null;
  year: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
