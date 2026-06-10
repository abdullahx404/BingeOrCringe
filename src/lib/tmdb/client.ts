/**
 * TMDB API client — SERVER ONLY.
 * The API key is never exposed to the browser.
 *
 * Base URL : https://api.themoviedb.org/3
 * Image URL: https://image.tmdb.org/t/p/{size}{path}
 */

import type {
  TmdbSearchResponse,
  TmdbMovieDetail,
  TmdbTvDetail,
  TmdbSeasonDetail,
  TmdbEpisodeDetail,
  TmdbTrendingResponse,
  NormalizedTitle,
  TmdbSearchMovie,
  TmdbSearchTv,
} from './types';

const BASE_URL = 'https://api.themoviedb.org/3';

/** Image CDN helper */
export function tmdbImage(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/** Generic fetch wrapper with error handling */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY is not configured');

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    // Next.js cache: revalidate trending every hour, search never
    next: { revalidate: endpoint.includes('trending') ? 3600 : 0 },
  });

  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

/* ─── Search ────────────────────────────────────────────── */
export async function searchMulti(query: string): Promise<TmdbSearchResponse> {
  return tmdbFetch<TmdbSearchResponse>('/search/multi', { query, page: '1' });
}

/* ─── Trending ──────────────────────────────────────────── */
export async function getTrending(): Promise<TmdbTrendingResponse> {
  return tmdbFetch<TmdbTrendingResponse>('/trending/all/week');
}

/* ─── Movie ─────────────────────────────────────────────── */
export async function getMovie(id: number): Promise<TmdbMovieDetail> {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${id}`);
}

/* ─── TV Show ───────────────────────────────────────────── */
export async function getTvShow(id: number): Promise<TmdbTvDetail> {
  return tmdbFetch<TmdbTvDetail>(`/tv/${id}`);
}

/* ─── Season ────────────────────────────────────────────── */
export async function getSeason(tvId: number, seasonNumber: number): Promise<TmdbSeasonDetail> {
  return tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
}

/* ─── Episode ───────────────────────────────────────────── */
export async function getEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TmdbEpisodeDetail> {
  return tmdbFetch<TmdbEpisodeDetail>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`
  );
}

/* ─── Normalizers ───────────────────────────────────────── */
export function normalizeMovie(m: TmdbSearchMovie): NormalizedTitle {
  return {
    id: m.id,
    mediaType: 'movie',
    title: m.title,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    year: m.release_date ? m.release_date.slice(0, 4) : '',
    overview: m.overview,
    rating: m.vote_average,
  };
}

export function normalizeTv(t: TmdbSearchTv): NormalizedTitle {
  return {
    id: t.id,
    mediaType: 'tv',
    title: t.name,
    posterPath: t.poster_path,
    backdropPath: t.backdrop_path,
    year: t.first_air_date ? t.first_air_date.slice(0, 4) : '',
    overview: t.overview,
    rating: t.vote_average,
  };
}
