'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/utils/tiers';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import { tmdbImage } from '@/lib/tmdb/client';
import DeleteRankingButton from './DeleteRankingButton';
import TvGroupAccordion, { type TvGroupData } from './TvGroupAccordion';
import styles from '../../app/dashboard/page.module.css';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

interface Props {
  movies: Ranking[];
  tvGroups: TvGroupData[];
}

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
            <Image src={poster} alt={ranking.title} fill sizes="180px" className={styles.posterImg} />
          ) : (
            <div className={styles.posterPlaceholder}><Film size={28} strokeWidth={1} /></div>
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
      <div className={styles.cardBody}>
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
          <Link href={href} className={`btn btn-ghost btn-sm ${styles.editBtn}`} title="Edit">
            <Edit2 size={13} />
          </Link>
          <DeleteRankingButton id={ranking.id} title={ranking.title} />
        </div>
      </div>
    </div>
  );
}

function TvPosterCard({
  group,
  isExpanded,
  onToggle,
}: {
  group: TvGroupData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = group.showRanking
    ? TIER_CONFIG[group.showRanking.tier as TierType]
    : null;
  const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
  const poster = tmdbImage(group.showPoster, 'w342');
  const showHref = `/title/tv/${group.tmdbId}`;
  const innerCount = group.seasons.length + group.episodes.length;

  return (
    <div className={`${styles.rankCard} ${isExpanded ? styles.rankCardExpanded : ''}`}>
      {/* Poster — click navigates to show page; Chevron toggles tree */}
      <Link href={showHref} className={styles.posterLink}>
        <div className={styles.poster}>
          {poster ? (
            <Image src={poster} alt={group.showTitle} fill sizes="180px" className={styles.posterImg} />
          ) : (
            <div className={styles.posterPlaceholder}><Tv size={28} strokeWidth={1} /></div>
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
      <div className={styles.cardBody}>
        <div className={styles.cardInfo}>
          <Link href={showHref} className={styles.cardTitle}>{group.showTitle}</Link>
          <div className={styles.cardMeta}>
            {group.showYear && <span>{group.showYear}</span>}
            <span className={styles.mediaTypePill}>TV</span>
          </div>
          {group.showRanking?.tags && (group.showRanking.tags as string[]).length > 0 ? (
            <div className={styles.tags}>
              {(group.showRanking.tags as string[]).slice(0, 3).map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          ) : (
            <div className={styles.tagsPlaceholder} />
          )}
        </div>
        <div className={styles.cardActions}>
          {group.showRanking && (
            <>
              <Link href={showHref} className={`btn btn-ghost btn-sm ${styles.editBtn}`} title="Edit">
                <Edit2 size={13} />
              </Link>
              <DeleteRankingButton id={group.showRanking.id} title={group.showTitle} />
            </>
          )}
          {/* Toggle tree — only if there are seasons/episodes ranked */}
          {innerCount > 0 && (
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${styles.expandBtn} ${isExpanded ? styles.expandBtnActive : ''}`}
              onClick={(e) => { e.preventDefault(); onToggle(); }}
              title={isExpanded ? 'Collapse seasons/episodes' : `${innerCount} item${innerCount !== 1 ? 's' : ''} ranked — click to expand`}
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionGrid({ movies, tvGroups }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const expandedGroup = tvGroups.find((g) => g.tmdbId === expandedId) ?? null;

  function toggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      {/* ── Unified grid: movies + TV poster cards ──── */}
      <div className={styles.grid}>
        {movies.map((r) => (
          <MovieCard key={r.id} ranking={r} />
        ))}
        {tvGroups.map((g) => (
          <TvPosterCard
            key={g.tmdbId}
            group={g}
            isExpanded={expandedId === g.tmdbId}
            onToggle={() => toggle(g.tmdbId)}
          />
        ))}
      </div>

      {/* ── Expanded tree panel (full-width, below grid) ─ */}
      {expandedGroup && (
        <div className={styles.treePanel}>
          <TvGroupAccordion group={expandedGroup} defaultExpanded />
        </div>
      )}
    </>
  );
}
