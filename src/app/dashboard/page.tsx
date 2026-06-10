import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { Film, Clapperboard, Trash2, Edit2 } from 'lucide-react';
import { Crown, Play, Minus, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import { tmdbImage, getTvShow } from '@/lib/tmdb/client';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import TierFilterTabs from '@/components/dashboard/TierFilterTabs';
import DeleteRankingButton from '@/components/dashboard/DeleteRankingButton';
import VisibilityToggle from '@/components/dashboard/VisibilityToggle';
import SearchInput from '@/components/search/SearchInput';
import TvGroupAccordion, { type TvGroupData } from '@/components/dashboard/TvGroupAccordion';
import styles from './page.module.css';

export const metadata = { title: 'My Collection' };

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

interface Props {
  searchParams: { tier?: string };
}

type TvGroupMap = Map<number, TvGroupData>;

function buildTvGroups(tvRelated: Ranking[]): TvGroupMap {
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

  // Fetch ALL rankings (filter at render time)
  const { data: allRaw } = await supabase
    .from('rankings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allRankings: Ranking[] = allRaw ?? [];

  // Count per tier for tabs
  const countByTier: Record<string, number> = {};
  for (const r of allRankings) {
    countByTier[r.tier] = (countByTier[r.tier] ?? 0) + 1;
  }

  // Separate movies from TV-related
  const movieRankings = allRankings.filter((r) => r.media_type === 'movie');
  const tvRelated = allRankings.filter((r) =>
    ['tv', 'season', 'episode'].includes(r.media_type)
  );

  // Group TV by show (tmdb_id)
  const tvGroupMap = buildTvGroups(tvRelated);

  // For groups without a show-level ranking, fetch show info from TMDB
  await Promise.all(
    Array.from(tvGroupMap.values())
      .filter((g) => !g.showRanking)
      .map(async (group) => {
        try {
          const show = await getTvShow(group.tmdbId);
          group.showTitle = show.name;
          group.showPoster = show.poster_path ?? null;
          group.showYear = show.first_air_date ? show.first_air_date.slice(0, 4) : null;
        } catch {
          const first = group.seasons[0] ?? group.episodes[0];
          group.showTitle = first?.title ?? `Show #${group.tmdbId}`;
          group.showPoster = first?.poster_path ?? null;
        }
      })
  );

  const tvGroups = Array.from(tvGroupMap.values());

  // Active tier filter
  const validTier = (searchParams.tier as TierType | undefined);
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

  const hasContent = filteredMovies.length > 0 || filteredTvGroups.length > 0;
  const totalRanked = allRankings.length;

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          {/* Logo → Browse */}
          <Link href="/search" className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </Link>

          {/* Search bar */}
          <div className={styles.headerSearch}>
            <Suspense>
              <SearchInput />
            </Suspense>
          </div>

          <div className={styles.headerRight}>
            {/* Browse button before username */}
            <Link href="/search" className="btn btn-ghost btn-sm">Browse</Link>
            <span className={styles.userBadge}>
              {profile?.display_name ?? user.email}
            </span>
            <form action={logOut}>
              <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          {/* Welcome strip */}
          <div className={styles.welcome}>
            <div>
              <h1 className={styles.welcomeTitle}>
                {profile?.display_name ?? 'Your'}&apos;s Collection
              </h1>
              <p className={styles.welcomeSub}>
                {totalRanked === 0
                  ? 'Nothing ranked yet — go search something and drop it in a tier.'
                  : `${totalRanked} ranking${totalRanked !== 1 ? 's' : ''} total`}
              </p>
            </div>
            <VisibilityToggle isPublic={profile?.is_public ?? false} />
          </div>

          {/* Tier filter tabs */}
          <TierFilterTabs
            activeTier={isTierValid ? validTier : undefined}
            countByTier={countByTier}
            total={totalRanked}
          />

          {/* Collection */}
          {!hasContent ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Film size={48} strokeWidth={1.2} />
              </div>
              <h2 className={styles.emptyTitle}>
                {isTierValid
                  ? `No ${TIER_CONFIG[validTier!].label} titles yet`
                  : 'Nothing ranked yet'}
              </h2>
              <p className={styles.emptyDesc}>
                {isTierValid
                  ? `You haven't ranked anything as ${TIER_CONFIG[validTier!].label}.`
                  : 'Search for a movie or show and rank it.'}
              </p>
              <Link href="/search" className="btn btn-primary">Search Titles</Link>
            </div>
          ) : (
            /* Single unified grid — movies + TV accordion cards side by side */
            <div className={styles.grid}>
              {filteredMovies.map((ranking) => (
                <MovieCard key={ranking.id} ranking={ranking} />
              ))}
              {filteredTvGroups.map((group) => (
                <TvGroupAccordion key={group.tmdbId} group={group} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Movie Card ───────────────────────────────────────────── */
function MovieCard({ ranking }: { ranking: Ranking }) {
  const cfg = TIER_CONFIG[ranking.tier as TierType];
  const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
  const poster = tmdbImage(ranking.poster_path, 'w342');
  const href = `/title/movie/${ranking.tmdb_id}`;

  return (
    <div className={styles.rankCard}>
      <Link href={href} className={styles.posterLink}>
        <div className={styles.poster}>
          {poster ? (
            <Image
              src={poster}
              alt={ranking.title}
              fill
              sizes="180px"
              className={styles.posterImg}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              <Film size={28} strokeWidth={1} />
            </div>
          )}
          {cfg && (
            <div
              className={styles.tierBadge}
              style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: cfg.bgColor }}
            >
              {Icon && <Icon size={11} />}
              <span>{cfg.label}</span>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.cardInfo}>
        <Link href={href} className={styles.cardTitle}>{ranking.title}</Link>
        <div className={styles.cardMeta}>
          {ranking.year && <span>{ranking.year}</span>}
          <span className={styles.mediaTypePill}>Movie</span>
        </div>
        {ranking.tags && (ranking.tags as string[]).length > 0 ? (
          <div className={styles.tags}>
            {(ranking.tags as string[]).slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        ) : (
          <div className={styles.tagsPlaceholder} />
        )}
      </div>

      <div className={styles.cardActions}>
        <Link href={href} className={`btn btn-ghost btn-sm ${styles.editBtn}`}>
          <Edit2 size={13} />
        </Link>
        <DeleteRankingButton id={ranking.id} title={ranking.title} />
      </div>
    </div>
  );
}
