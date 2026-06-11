import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GlobalNav from '@/components/nav/GlobalNav';
import CollectionGrid from '@/components/dashboard/CollectionGrid';
import TierFilterTabs from '@/components/dashboard/TierFilterTabs';
import Link from 'next/link';
import { Lock, User } from 'lucide-react';
import type { Ranking } from '@/types';
import { TIERS } from '@/lib/utils/tiers';
import type { TierType } from '@/lib/utils/tiers';
import { getTvShow } from '@/lib/tmdb/client';
import { type TvGroupData } from '@/components/dashboard/TvGroupAccordion';
import styles from './page.module.css';

interface Props {
  params: { username: string };
  searchParams: { tier?: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `@${params.username}'s Collection` };
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

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const supabase = await createClient();

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username, bio, avatar_url, is_public')
    .eq('username', params.username)
    .single();

  if (!profile) {
    notFound();
  }

  // 1.5. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className={styles.page}>
        <GlobalNav />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.privateState}>
              <Lock size={48} className={styles.privateIcon} />
              <h1 className={styles.privateTitle}>Log in to view</h1>
              <p className={styles.privateDesc}>Log in to see @{params.username}&apos;s list.</p>
              <div style={{ marginTop: '16px' }}>
                <Link href="/login" className="btn btn-primary">Log In</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. Privacy check
  if (!profile.is_public) {
    return (
      <div className={styles.page}>
        <GlobalNav />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.privateState}>
              <Lock size={48} className={styles.privateIcon} />
              <h1 className={styles.privateTitle}>@{profile.username}&apos;s Collection is Private</h1>
              <p className={styles.privateDesc}>This user has chosen not to share their rankings publicly.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Fetch their rankings
  const { data: allRaw } = await supabase
    .from('rankings')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const allRankings: Ranking[] = allRaw ?? [];

  // 4. Calculate stats & groupings (reusing logic from dashboard)
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

  return (
    <div className={styles.page}>
      <GlobalNav />
      
      {/* Profile Header */}
      <header className={styles.profileHeader}>
        <div className="container">
          <div className={styles.headerLayout}>
            <div className={styles.avatarWrap}>
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.display_name} className={styles.avatar} />
              ) : (
                <User size={40} className={styles.avatarFallback} />
              )}
            </div>
            
            <div className={styles.userInfo}>
              <h1 className={styles.displayName}>{profile.display_name}</h1>
              <p className={styles.username}>@{profile.username}</p>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            </div>

            <div className={styles.stats}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{totalRanked}</span>
                <span className={styles.statLabel}>Total Ranked</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          <TierFilterTabs
            activeTier={isTierValid ? validTier : undefined}
            countByTier={countByTier}
            total={totalRanked}
          />

          {!hasContent ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>Nothing here yet</h2>
              <p className={styles.emptyDesc}>This user hasn&apos;t ranked anything in this category.</p>
            </div>
          ) : (
            // readonly=true implies we should hide edit/delete buttons, let's pass a prop if needed
            // Right now CollectionGrid assumes it's the current user. We should update CollectionGrid 
            // to accept `readonly={true}` to hide actions!
            <CollectionGrid movies={filteredMovies} tvGroups={filteredTvGroups} isPublicView />
          )}
        </div>
      </main>
    </div>
  );
}
