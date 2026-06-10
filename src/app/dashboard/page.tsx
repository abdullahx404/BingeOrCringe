import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Globe, Lock, Info, Clapperboard, Trash2, Edit2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import { Crown, Play, Minus, ThumbsDown } from 'lucide-react';
import { tmdbImage } from '@/lib/tmdb/client';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import TierFilterTabs from '@/components/dashboard/TierFilterTabs';
import DeleteRankingButton from '@/components/dashboard/DeleteRankingButton';
import styles from './page.module.css';

export const metadata = { title: 'My Collection' };

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

interface Props {
  searchParams: { tier?: string };
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

  // Build query with optional tier filter
  const activeTier = searchParams.tier as TierType | undefined;
  let query = supabase
    .from('rankings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (activeTier && TIERS.includes(activeTier)) {
    query = query.eq('tier', activeTier) as typeof query;
  }

  const { data: rankings } = await query;
  const allRankings = rankings ?? [];

  // Count per tier for the tabs
  const { data: tierCounts } = await supabase
    .from('rankings')
    .select('tier')
    .eq('user_id', user.id);

  const countByTier: Record<string, number> = {};
  for (const row of tierCounts ?? []) {
    countByTier[row.tier] = (countByTier[row.tier] ?? 0) + 1;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </Link>

          <nav className={styles.headerNav}>
            <Link href="/search" className="btn btn-ghost btn-sm">Search</Link>
          </nav>

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
                {allRankings.length === 0
                  ? "Nothing ranked yet — go search something and drop it in a tier."
                  : `${tierCounts?.length ?? 0} titles ranked total`}
              </p>
            </div>
            <div className={styles.visibilityBadge}>
              {profile?.is_public
                ? <><Globe size={14} /> Public</>
                : <><Lock size={14} /> Private</>}
            </div>
          </div>

          {/* Tier filter tabs */}
          <TierFilterTabs
            activeTier={activeTier}
            countByTier={countByTier}
            total={tierCounts?.length ?? 0}
          />

          {/* Collection grid */}
          {allRankings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Film size={48} strokeWidth={1.2} />
              </div>
              <h2 className={styles.emptyTitle}>
                {activeTier ? `No ${TIER_CONFIG[activeTier].label} titles yet` : 'Nothing ranked yet'}
              </h2>
              <p className={styles.emptyDesc}>
                {activeTier
                  ? `You haven't ranked anything as ${TIER_CONFIG[activeTier].label}.`
                  : 'Search for a movie or show and rank it.'}
              </p>
              <Link href="/search" className="btn btn-primary">Search Titles</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {allRankings.map((ranking: Ranking) => {
                const cfg = TIER_CONFIG[ranking.tier as TierType];
                const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
                const poster = tmdbImage(ranking.poster_path, 'w342');
                const href = ranking.media_type === 'movie'
                  ? `/title/movie/${ranking.tmdb_id}`
                  : `/title/tv/${ranking.tmdb_id}`;

                return (
                  <div key={ranking.id} className={styles.rankCard}>
                    {/* Poster */}
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

                        {/* Tier overlay */}
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

                    {/* Info */}
                    <div className={styles.cardInfo}>
                      <Link href={href} className={styles.cardTitle}>{ranking.title}</Link>
                      <div className={styles.cardMeta}>
                        {ranking.year && <span>{ranking.year}</span>}
                        <span className={styles.mediaTypePill}>
                          {ranking.media_type === 'movie' ? 'Movie' : 'TV'}
                        </span>
                      </div>

                      {/* Tags */}
                      {ranking.tags && ranking.tags.length > 0 && (
                        <div className={styles.tags}>
                          {(ranking.tags as string[]).slice(0, 2).map((tag: string) => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                          {(ranking.tags as string[]).length > 2 && (
                            <span className={styles.tagMore}>+{(ranking.tags as string[]).length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <Link href={href} className={`btn btn-ghost btn-sm ${styles.editBtn}`}>
                        <Edit2 size={13} />
                      </Link>
                      <DeleteRankingButton id={ranking.id} title={ranking.title} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phase notice */}
          {allRankings.length > 0 && (
            <div className={styles.phaseNotice}>
              <Info size={14} />
              <p>Public profiles and collection sharing coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
