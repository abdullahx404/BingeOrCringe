import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SearchX, TrendingUp, AlertCircle, Clapperboard, User } from 'lucide-react';
import {
  searchMulti,
  getTrending,
  normalizeMovie,
  normalizeTv,
} from '@/lib/tmdb/client';
import type { TmdbSearchMovie, TmdbSearchTv } from '@/lib/tmdb/types';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import SearchResultCard from '@/components/search/SearchResultCard';
import SearchInput from '@/components/search/SearchInput';
import GlobalNav from '@/components/nav/GlobalNav';
import TopRankers from '@/components/search/TopRankers';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search movies and TV shows. Drop them in a tier.',
};

interface Props {
  searchParams: { q?: string; type?: string };
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

// ── User Search ──────────────────────────────────────────

async function UserSearchResults({ query }: { query: string }) {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);

  if (error || !profiles || profiles.length === 0) {
    return (
      <div className={styles.emptyState}>
        <SearchX size={40} className={styles.emptyIcon} strokeWidth={1.5} />
        <h2 className={styles.emptyTitle}>No users found for &ldquo;{query}&rdquo;</h2>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <p className={styles.resultCount}>
        {profiles.length} results for &ldquo;{query}&rdquo;
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <Link href={`/u/${p.username}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.avatar_url ? <img src={p.avatar_url} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--text-muted)" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.display_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{p.username}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? '';
  const type = searchParams.type === 'users' ? 'users' : 'titles';

    <div className={styles.page}>
      <GlobalNav />

      {/* ── Main content ────────────────────────────── */}
      <main className={styles.main}>
        <div className="container">
          {type === 'users' && !query ? <TopRankers /> : null}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Link 
              href={`/search?q=${encodeURIComponent(query)}&type=titles`} 
              style={{ padding: '8px 16px', color: type === 'titles' ? 'var(--accent-light)' : 'var(--text-muted)', borderBottom: type === 'titles' ? '2px solid var(--accent-light)' : '2px solid transparent', textDecoration: 'none', fontWeight: 600 }}
            >
              Titles
            </Link>
            <Link 
              href={`/search?q=${encodeURIComponent(query)}&type=users`} 
              style={{ padding: '8px 16px', color: type === 'users' ? 'var(--accent-light)' : 'var(--text-muted)', borderBottom: type === 'users' ? '2px solid var(--accent-light)' : '2px solid transparent', textDecoration: 'none', fontWeight: 600 }}
            >
              Users
            </Link>
          </div>

          <Suspense fallback={<GridSkeleton />}>
            {type === 'users' ? (
              query ? <UserSearchResults query={query} /> : (
                <div className={styles.emptyState}>
                  <User size={40} className={styles.emptyIcon} strokeWidth={1.5} color="var(--text-muted)" />
                  <h2 className={styles.emptyTitle}>Search for users</h2>
                  <p className={styles.emptyDesc}>Type a username or display name to find friends.</p>
                </div>
              )
            ) : (
              query ? <SearchResults query={query} /> : <TrendingSection />
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
