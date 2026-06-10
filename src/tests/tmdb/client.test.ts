import { describe, it, expect } from 'vitest';
import { tmdbImage, normalizeMovie, normalizeTv } from '@/lib/tmdb/client';
import type { TmdbSearchMovie, TmdbSearchTv } from '@/lib/tmdb/types';

describe('tmdbImage', () => {
  it('returns null when path is null', () => {
    expect(tmdbImage(null)).toBeNull();
  });

  it('returns null when path is empty string', () => {
    expect(tmdbImage('')).toBeNull();
  });

  it('returns correct URL with default w500 size', () => {
    const result = tmdbImage('/abc123.jpg');
    expect(result).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg');
  });

  it('respects custom size parameter', () => {
    expect(tmdbImage('/abc123.jpg', 'w342')).toBe(
      'https://image.tmdb.org/t/p/w342/abc123.jpg'
    );
    expect(tmdbImage('/abc123.jpg', 'original')).toBe(
      'https://image.tmdb.org/t/p/original/abc123.jpg'
    );
  });
});

describe('normalizeMovie', () => {
  const mockMovie: TmdbSearchMovie = {
    id: 123,
    media_type: 'movie',
    title: 'Inception',
    original_title: 'Inception',
    overview: 'A thief who steals corporate secrets.',
    poster_path: '/inception.jpg',
    backdrop_path: '/inception_back.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    vote_count: 30000,
    genre_ids: [28, 878],
    popularity: 100,
  };

  it('sets mediaType to movie', () => {
    expect(normalizeMovie(mockMovie).mediaType).toBe('movie');
  });

  it('extracts year from release_date', () => {
    expect(normalizeMovie(mockMovie).year).toBe('2010');
  });

  it('maps title correctly', () => {
    expect(normalizeMovie(mockMovie).title).toBe('Inception');
  });

  it('passes through poster and backdrop paths', () => {
    const n = normalizeMovie(mockMovie);
    expect(n.posterPath).toBe('/inception.jpg');
    expect(n.backdropPath).toBe('/inception_back.jpg');
  });

  it('handles empty release_date gracefully', () => {
    const result = normalizeMovie({ ...mockMovie, release_date: '' });
    expect(result.year).toBe('');
  });
});

describe('normalizeTv', () => {
  const mockTv: TmdbSearchTv = {
    id: 456,
    media_type: 'tv',
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    overview: 'A chemistry teacher turned drug kingpin.',
    poster_path: '/bb.jpg',
    backdrop_path: '/bb_back.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    vote_count: 12000,
    genre_ids: [80, 18],
    popularity: 200,
  };

  it('sets mediaType to tv', () => {
    expect(normalizeTv(mockTv).mediaType).toBe('tv');
  });

  it('uses name (not title) for TV shows', () => {
    expect(normalizeTv(mockTv).title).toBe('Breaking Bad');
  });

  it('extracts year from first_air_date', () => {
    expect(normalizeTv(mockTv).year).toBe('2008');
  });

  it('handles empty first_air_date', () => {
    expect(normalizeTv({ ...mockTv, first_air_date: '' }).year).toBe('');
  });
});
