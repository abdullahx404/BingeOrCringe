import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Film, Clapperboard } from 'lucide-react';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import { getTvShow } from '@/lib/tmdb/client';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import TierFilterTabs from '@/components/dashboard/TierFilterTabs';
import VisibilityToggle from '@/components/dashboard/VisibilityToggle';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import SearchInput from '@/components/search/SearchInput';
import { type TvGroupData } from '@/components/dashboard/TvGroupAccordion';
import CollectionGrid from '@/components/dashboard/CollectionGrid';
import NavLinks from '@/components/nav/NavLinks';
import CustomListsRow from '@/components/lists/CustomListsRow';
import type { CustomList } from '@/types';
import styles from './page.module.css';

export const metadata = { title: 'My Collection' };

interface Props {
  searchParams: { tier?: string };
}

function buildTvGroups(tvRelated: Ranking[]): Map<number, TvGroupData> {
  const map = new Map<number, TvGroupData>();
  for (const r of tvRelated) {
    if (!map.has(r.tmdb_id)) {
      map.set(r.tmdb_id, {
        tmdbId: r.tmdb_id,
        showTitle: '',
        showPoster: null,
        showYear: null,
        showRanking: null,
        seasons: [],
        episodes: [],
      });
    }
    const g = map.get(r.tmdb_id)!;
    if (r.media_type === 'tv') {
      g.showRanking = r;
      g.showTitle = r.title;
      g.showPoster = r.poster_path;
      g.showYear = r.year;
    } else if (r.media_type === 'season') {
      g.seasons.push(r);
    } else {
      g.episodes.push(r);
    }
  }
  return map;
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, is_public')
    .eq('id', user.id)
    .single();

  const { data: allRaw } = await supabase
    .from('rankings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allRankings: Ranking[] = allRaw ?? [];

  const { data: rawLists } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const userLists: CustomList[] = rawLists ?? [];

  const countByTier: Record<string, number> = {};
  for (const r of allRankings) {
    countByTier[r.tier] = (countByTier[r.tier] ?? 0) + 1;
  }

  const movieRankings = allRankings.filter((r) => r.media_type === 'movie');
  const tvRelated    = allRankings.filter((r) => ['tv', 'season', 'episode'].includes(r.media_type));

  const tvGroupMap = buildTvGroups(tvRelated);

  await Promise.all(
    Array.from(tvGroupMap.values())
      .filter((g) => !g.showRanking)
      .map(async (group) => {
        try {
          const show = await getTvShow(group.tmdbId);
          group.showTitle  = show.name;
          group.showPoster = show.poster_path ?? null;
          group.showYear   = show.first_air_date ? show.first_air_date.slice(0, 4) : null;
        } catch {
          const first = group.seasons[0] ?? group.episodes[0];
          group.showTitle  = first?.title ?? `Show #${group.tmdbId}`;
          group.showPoster = first?.poster_path ?? null;
        }
      })
  );

  const tvGroups = Array.from(tvGroupMap.values());

  const validTier   = searchParams.tier as TierType | undefined;
  const isTierValid = validTier && TIERS.includes(validTier);

  const filteredMovies = isTierValid
    ? movieRankings.filter((r) => r.tier === validTier)
    : movieRankings;

  const filteredTvGroups = isTierValid
    ? tvGroups.filter(
        (g) =>
          g.showRanking?.tier === validTier ||
          g.seasons.some((s) => s.tier === validTier) ||
          g.episodes.some((e) => e.tier === validTier)
      )
    : tvGroups;

  const hasContent  = filteredMovies.length > 0 || filteredTvGroups.length > 0;
  const totalRanked = allRankings.length;
  const displayName = profile?.display_name ?? user.email ?? '';

  return (
    <div className={styles.page}>
      {/* ── Sticky header ────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/search" className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </Link>

          <div className={styles.headerSearch}>
            <Suspense>
              <SearchInput />
            </Suspense>
          </div>

          <div className={styles.headerRight}>
            <NavLinks isLoggedIn displayName={displayName} username={profile?.username} />
          </div>
        </div>
        {/* Mobile: search appears below nav row */}
        <div className={styles.mobileSearch}>
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <div className={styles.welcome}>
            <div>
              <h1 className={styles.welcomeTitle}>
                {profile?.display_name ?? 'Your'}&apos;s Collection
              </h1>
              <p className={styles.welcomeSub}>
                {totalRanked === 0
                  ? 'Nothing ranked yet — search something and drop it in a tier.'
                  : `${totalRanked} ranking${totalRanked !== 1 ? 's' : ''} total`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {profile?.is_public && profile?.username && (
                <ShareProfileButton username={profile.username} />
              )}
              <VisibilityToggle isPublic={profile?.is_public ?? false} />
            </div>
          </div>

          <CustomListsRow lists={userLists} />

          <TierFilterTabs
            activeTier={isTierValid ? validTier : undefined}
            countByTier={countByTier}
            total={totalRanked}
          />

          {!hasContent ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Film size={48} strokeWidth={1.2} /></div>
              <h2 className={styles.emptyTitle}>
                {isTierValid ? `No ${TIER_CONFIG[validTier!].label} titles yet` : 'Nothing ranked yet'}
              </h2>
              <p className={styles.emptyDesc}>
                {isTierValid
                  ? `You haven't ranked anything as ${TIER_CONFIG[validTier!].label}.`
                  : 'Search for a movie or show and rank it.'}
              </p>
              <Link href="/search" className="btn btn-primary">Search Titles</Link>
            </div>
          ) : (
            <CollectionGrid movies={filteredMovies} tvGroups={filteredTvGroups} />
          )}
        </div>
      </main>
    </div>
  );
}
