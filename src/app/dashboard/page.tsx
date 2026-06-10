import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { Film, Info, Clapperboard, Trash2, Edit2, Tv } from 'lucide-react';
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
import styles from './page.module.css';

export const metadata = { title: 'My Collection' };

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

interface Props {
  searchParams: { tier?: string };
}

type TvGroup = {
  tmdbId: number;
  showTitle: string;
  showPoster: string | null;
  showYear: string | null;
  showRanking: Ranking | null;
  seasons: Ranking[];
  episodes: Ranking[];
};

function buildTvGroups(tvRelated: Ranking[]): Map<number, TvGroup> {
  const map = new Map<number, TvGroup>();
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

  // Fetch ALL rankings (unfiltered for grouping, filter applied at render)
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

  // Group TV by tmdb_id
  const tvGroupMap = buildTvGroups(tvRelated);

  // For groups without a show-level ranking, fetch show info from TMDB
  const missingFetches = Array.from(tvGroupMap.values()).filter((g) => !g.showRanking);
  await Promise.all(
    missingFetches.map(async (group) => {
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
  const activeTier = (searchParams.tier as TierType | undefined);
  const validTier = activeTier && TIERS.includes(activeTier) ? activeTier : undefined;

  const filteredMovies = validTier
    ? movieRankings.filter((r) => r.tier === validTier)
    : movieRankings;

  const filteredTvGroups = validTier
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
          <Link href="/" className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </Link>

          {/* Search bar — navigates to /search */}
          <div className={styles.headerSearch}>
            <Suspense>
              <SearchInput />
            </Suspense>
          </div>

          <div className={styles.headerRight}>
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
            activeTier={validTier}
            countByTier={countByTier}
            total={totalRanked}
          />

          {/* Collection content */}
          {!hasContent ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Film size={48} strokeWidth={1.2} />
              </div>
              <h2 className={styles.emptyTitle}>
                {validTier ? `No ${TIER_CONFIG[validTier].label} titles yet` : 'Nothing ranked yet'}
              </h2>
              <p className={styles.emptyDesc}>
                {validTier
                  ? `You haven't ranked anything as ${TIER_CONFIG[validTier].label}.`
                  : 'Search for a movie or show and rank it.'}
              </p>
              <Link href="/search" className="btn btn-primary">Search Titles</Link>
            </div>
          ) : (
            <div className={styles.collectionWrap}>
              {/* ── Movies grid ─────────────────────── */}
              {filteredMovies.length > 0 && (
                <div className={styles.grid}>
                  {filteredMovies.map((ranking) => (
                    <RankCard key={ranking.id} ranking={ranking} />
                  ))}
                </div>
              )}

              {/* ── TV Show groups ───────────────────── */}
              {filteredTvGroups.length > 0 && (
                <div className={styles.tvSection}>
                  {filteredTvGroups.map((group) => (
                    <TvGroupCard key={group.tmdbId} group={group} activeTier={validTier} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function RankCard({ ranking }: { ranking: Ranking }) {
  const cfg = TIER_CONFIG[ranking.tier as TierType];
  const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
  const poster = tmdbImage(ranking.poster_path, 'w342');
  const href =
    ranking.media_type === 'movie'
      ? `/title/movie/${ranking.tmdb_id}`
      : `/title/tv/${ranking.tmdb_id}`;

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
          <span className={styles.mediaTypePill}>
            {ranking.media_type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
        {ranking.tags && (ranking.tags as string[]).length > 0 ? (
          <div className={styles.tags}>
            {(ranking.tags as string[]).slice(0, 3).map((tag: string) => (
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

function TierPill({ tier }: { tier: TierType }) {
  const cfg = TIER_CONFIG[tier];
  const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
  return (
    <span
      className={styles.inlineTierPill}
      style={{ color: cfg.color, background: cfg.bgColor, borderColor: `${cfg.color}40` }}
    >
      {Icon && <Icon size={10} />}
      {cfg.label}
    </span>
  );
}

function TvGroupCard({ group, activeTier }: { group: TvGroup; activeTier?: TierType }) {
  const showPosterUrl = tmdbImage(group.showPoster, 'w342');
  const showHref = `/title/tv/${group.tmdbId}`;

  // Filter seasons/episodes if a tier is active
  const seasons = activeTier
    ? group.seasons.filter((s) => s.tier === activeTier)
    : group.seasons;
  const episodes = activeTier
    ? group.episodes.filter((e) => e.tier === activeTier)
    : group.episodes;

  // Group episodes by season number for display
  const episodesBySeason = episodes.reduce<Record<number, Ranking[]>>((acc, ep) => {
    const sn = ep.season_number ?? 0;
    if (!acc[sn]) acc[sn] = [];
    acc[sn].push(ep);
    return acc;
  }, {});

  return (
    <div className={styles.tvGroup}>
      {/* Show header */}
      <div className={styles.tvShowRow}>
        <Link href={showHref} className={styles.tvPosterLink}>
          <div className={styles.tvPoster}>
            {showPosterUrl ? (
              <Image src={showPosterUrl} alt={group.showTitle} fill sizes="64px" className={styles.tvPosterImg} />
            ) : (
              <div className={styles.tvPosterPlaceholder}><Tv size={20} strokeWidth={1} /></div>
            )}
          </div>
        </Link>

        <div className={styles.tvShowInfo}>
          <Link href={showHref} className={styles.tvShowTitle}>{group.showTitle}</Link>
          <div className={styles.tvShowMeta}>
            {group.showYear && <span>{group.showYear}</span>}
            <span className={styles.mediaTypePill}>TV</span>
            {group.showRanking && <TierPill tier={group.showRanking.tier as TierType} />}
          </div>
          {group.showRanking?.tags && (group.showRanking.tags as string[]).length > 0 && (
            <div className={styles.tvTags}>
              {(group.showRanking.tags as string[]).slice(0, 3).map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {group.showRanking && (
          <div className={styles.tvActions}>
            <Link href={showHref} className={`btn btn-ghost btn-sm ${styles.editBtn}`}>
              <Edit2 size={13} />
            </Link>
            <DeleteRankingButton id={group.showRanking.id} title={group.showTitle} />
          </div>
        )}
      </div>

      {/* Ranked seasons */}
      {seasons.length > 0 && (
        <div className={styles.tvSubList}>
          {seasons.map((s) => (
            <div key={s.id} className={styles.tvSubRow}>
              <div className={styles.tvSubIndent} />
              <Link
                href={`/title/tv/${group.tmdbId}/season/${s.season_number}`}
                className={styles.tvSubLink}
              >
                Season {s.season_number}
              </Link>
              <TierPill tier={s.tier as TierType} />
              {s.tags && (s.tags as string[]).length > 0 && (
                <div className={styles.tvSubTags}>
                  {(s.tags as string[]).slice(0, 2).map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
              <div className={styles.tvSubActions}>
                <Link
                  href={`/title/tv/${group.tmdbId}/season/${s.season_number}`}
                  className={`btn btn-ghost btn-sm ${styles.editBtn}`}
                >
                  <Edit2 size={12} />
                </Link>
                <DeleteRankingButton id={s.id} title={`Season ${s.season_number}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ranked episodes grouped under their season */}
      {Object.entries(episodesBySeason).map(([sn, eps]) => (
        <div key={sn} className={styles.tvSubList}>
          <div className={styles.tvSeasonLabel}>Season {sn} Episodes</div>
          {eps.map((ep) => (
            <div key={ep.id} className={styles.tvSubRow}>
              <div className={styles.tvSubIndent} />
              <Link
                href={`/title/tv/${group.tmdbId}/season/${ep.season_number}/episode/${ep.episode_number}`}
                className={styles.tvSubLink}
              >
                E{ep.episode_number} · {ep.title}
              </Link>
              <TierPill tier={ep.tier as TierType} />
              <div className={styles.tvSubActions}>
                <DeleteRankingButton id={ep.id} title={ep.title} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
