/**
 * TMDB API TypeScript types
 * Based on TMDB API v3 response shapes
 */

export type TmdbMediaType = 'movie' | 'tv' | 'person';

/* ─── Shared ────────────────────────────────────────────── */
export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

/* ─── Search ────────────────────────────────────────────── */
export interface TmdbSearchMovie {
  id: number;
  media_type: 'movie';
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TmdbSearchTv {
  id: number;
  media_type: 'tv';
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TmdbSearchPerson {
  id: number;
  media_type: 'person';
  name: string;
}

export type TmdbSearchResult = TmdbSearchMovie | TmdbSearchTv | TmdbSearchPerson;

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

/* ─── Movie Detail ──────────────────────────────────────── */
export interface TmdbMovieDetail {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: TmdbGenre[];
  status: string;
  tagline: string | null;
  popularity: number;
  production_companies: TmdbProductionCompany[];
  spoken_languages: { english_name: string; name: string }[];
  budget: number;
  revenue: number;
  imdb_id: string | null;
  homepage: string | null;
}

/* ─── TV Detail ─────────────────────────────────────────── */
export interface TmdbTvSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number;
  season_number: number;
  vote_average: number;
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: TmdbGenre[];
  status: string;
  tagline: string | null;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TmdbTvSeason[];
  episode_run_time: number[];
  in_production: boolean;
  networks: { id: number; name: string; logo_path: string | null }[];
  type: string;
}

/* ─── Season Detail ─────────────────────────────────────── */
export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export interface TmdbSeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  season_number: number;
  vote_average: number;
  episodes: TmdbEpisode[];
}

/* ─── Episode Detail ────────────────────────────────────── */
export interface TmdbEpisodeDetail extends TmdbEpisode {
  crew: { id: number; name: string; job: string; profile_path: string | null }[];
  guest_stars: { id: number; name: string; character: string; profile_path: string | null }[];
}

/* ─── Trending ──────────────────────────────────────────── */
export interface TmdbTrendingResponse {
  page: number;
  results: (TmdbSearchMovie | TmdbSearchTv)[];
  total_pages: number;
  total_results: number;
}

/* ─── Utility types ─────────────────────────────────────── */
/** Normalised result card — same shape regardless of movie/tv */
export interface NormalizedTitle {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string;
  overview: string;
  rating: number;
}
