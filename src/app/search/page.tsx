import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchX, TrendingUp, AlertCircle, Clapperboard } from 'lucide-react';
import {
  searchMulti,
  getTrending,
  normalizeMovie,
  normalizeTv,
} from '@/lib/tmdb/client';
import type { TmdbSearchMovie, TmdbSearchTv } from '@/lib/tmdb/types';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchInput from '@/components/search/SearchInput';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search movies and TV shows. Drop them in a tier.',
};

interface Props {
  searchParams: { q?: string };
}

async function SearchResults({ query }: { query: string }) {
  try {
    const data = await searchMulti(query);
    const results = data.results
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .map((r) =>
        r.media_type === 'movie'
          ? normalizeMovie(r as TmdbSearchMovie)
          : normalizeTv(r as TmdbSearchTv)
      )
      .filter((r) => r.posterPath);

    if (results.length === 0) {
      return (
        <div className={styles.emptyState}>
          <SearchX size={40} className={styles.emptyIcon} strokeWidth={1.5} />
          <h2 className={styles.emptyTitle}>No results for &ldquo;{query}&rdquo;</h2>
          <p className={styles.emptyDesc}>Check the spelling or try a different title.</p>
        </div>
      );
    }

    return (
      <section className={styles.section}>
        <p className={styles.resultCount}>
          {data.total_results.toLocaleString()} results for &ldquo;{query}&rdquo;
        </p>
        <div className={styles.grid}>
          {results.map((r) => (
            <SearchResultCard key={`${r.mediaType}-${r.id}`} title={r} />
          ))}
        </div>
      </section>
    );
  } catch {
    return (
      <div className={styles.errorState}>
        <AlertCircle size={20} />
        <p>Search is unavailable right now. Try again in a moment.</p>
      </div>
    );
  }
}

async function TrendingSection() {
  try {
    const data = await getTrending();
    const titles = data.results
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 20)
      .map((r) =>
        r.media_type === 'movie'
          ? normalizeMovie(r as TmdbSearchMovie)
          : normalizeTv(r as TmdbSearchTv)
      );

    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <TrendingUp size={20} />
          Trending This Week
        </h2>
        <div className={styles.grid}>
          {titles.map((t) => (
            <SearchResultCard key={`${t.mediaType}-${t.id}`} title={t} />
          ))}
        </div>
      </section>
    );
  } catch {
    return (
      <div className={styles.errorState}>
        <AlertCircle size={20} />
        <p>Could not load trending titles. Try refreshing.</p>
      </div>
    );
  }
}

function GridSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={`skeleton ${styles.skeletonPoster}`} />
          <div className={`skeleton ${styles.skeletonText}`} />
          <div className={`skeleton ${styles.skeletonTextShort}`} />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? '';

  return (
    <div className={styles.page}>
      {/* ── Header with integrated search ──────────── */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          {/* Logo */}
          <a href="/" className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </a>

          {/* Search bar — inline in header */}
          <div className={styles.headerSearch}>
            <Suspense>
              <SearchInput />
            </Suspense>
          </div>

          {/* Nav links */}
          <div className={styles.headerLinks}>
            <a href="/dashboard" className="btn btn-ghost btn-sm">My List</a>
            <a href="/login" className="btn btn-primary btn-sm">Log In</a>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────── */}
      <main className={styles.main}>
        <div className="container">
          <Suspense fallback={<GridSkeleton />}>
            {query ? <SearchResults query={query} /> : <TrendingSection />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
