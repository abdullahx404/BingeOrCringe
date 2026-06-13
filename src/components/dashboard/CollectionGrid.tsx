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
  isPublicView?: boolean;
}

function MovieCard({ ranking, isPublicView }: { ranking: Ranking; isPublicView?: boolean }) {
  const cfg = TIER_CONFIG[ranking.tier as TierType];
  const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
  const poster = tmdbImage(ranking.poster_path, 'w342');
  const href = `/title/movie/${ranking.tmdb_id}`;

  return (
    <div className={styles.rankCard}>
      {/* ── Poster with overlay actions ── */}
      <div className={styles.posterWrapper}>
        <Link href={href} className={styles.posterLink}>
          <div className={styles.poster}>
            {poster ? (
              <Image src={poster} alt={ranking.title} fill sizes="260px" className={styles.posterImg} />
            ) : (
              <div className={styles.posterPlaceholder}><Film size={32} strokeWidth={1} /></div>
            )}
            {/* Tier badge — bottom-left */}
            {cfg && (
              <div
                className={styles.tierBadge}
                style={{ background: cfg.color, color: '#000' }}
              >
                {Icon && <Icon size={11} />}
                <span>{cfg.label}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Edit / Delete — top-right glass overlay, revealed on hover */}
        {!isPublicView && (
          <div className={styles.overlayActions}>
            <Link href={href} className={styles.overlayBtn} title="Edit ranking">
              <Edit2 size={14} />
            </Link>
            <DeleteRankingButton
              id={ranking.id}
              title={ranking.title}
              btnClassName={styles.overlayDeleteBtn}
            />
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className={styles.cardBody}>
        <Link href={href} className={styles.cardTitle}>{ranking.title}</Link>

        {/* Year + type — no expand for movies */}
        <div className={styles.cardMeta}>
          {ranking.year && <span>{ranking.year}</span>}
          <span className={styles.mediaTypePill}>Movie</span>
        </div>

        {/* Tags */}
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
    </div>
  );
}

function TvPosterCard({
  group,
  isExpanded,
  onToggle,
  isPublicView,
}: {
  group: TvGroupData;
  isExpanded: boolean;
  onToggle: () => void;
  isPublicView?: boolean;
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
      {/* ── Poster with overlay actions ── */}
      <div className={styles.posterWrapper}>
        <Link href={showHref} className={styles.posterLink}>
          <div className={styles.poster}>
            {poster ? (
              <Image src={poster} alt={group.showTitle} fill sizes="260px" className={styles.posterImg} />
            ) : (
              <div className={styles.posterPlaceholder}><Tv size={32} strokeWidth={1} /></div>
            )}
            {cfg && (
              <div
                className={styles.tierBadge}
                style={{ background: cfg.color, color: '#000' }}
              >
                {Icon && <Icon size={11} />}
                <span>{cfg.label}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Edit / Delete overlay (only if show itself is ranked) */}
        {!isPublicView && group.showRanking && (
          <div className={styles.overlayActions}>
            <Link href={showHref} className={styles.overlayBtn} title="Edit ranking">
              <Edit2 size={14} />
            </Link>
            <DeleteRankingButton
              id={group.showRanking.id}
              title={group.showTitle}
              btnClassName={styles.overlayDeleteBtn}
            />
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className={styles.cardBody}>
        <Link href={showHref} className={styles.cardTitle}>{group.showTitle}</Link>

        {/* Year + type + expand chevron (inline) */}
        <div className={styles.cardMeta}>
          {group.showYear && <span>{group.showYear}</span>}
          <span className={styles.mediaTypePill}>TV</span>

          {/* Expand chevron — in same row as date, pushed to the right */}
          {innerCount > 0 && (
            <button
              type="button"
              className={`${styles.expandBtnInline} ${isExpanded ? styles.expandBtnInlineActive : ''}`}
              onClick={(e) => { e.preventDefault(); onToggle(); }}
              title={isExpanded ? 'Collapse' : `${innerCount} season/episode ranked`}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Tags */}
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
    </div>
  );
}

export default function CollectionGrid({ movies, tvGroups, isPublicView }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const expandedGroup = tvGroups.find((g) => g.tmdbId === expandedId) ?? null;

  function toggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <div className={styles.grid}>
        {movies.map((r) => (
          <MovieCard key={r.id} ranking={r} isPublicView={isPublicView} />
        ))}
        {tvGroups.map((g) => (
          <TvPosterCard
            key={g.tmdbId}
            group={g}
            isExpanded={expandedId === g.tmdbId}
            onToggle={() => toggle(g.tmdbId)}
            isPublicView={isPublicView}
          />
        ))}
      </div>

      {expandedGroup && (
        <div className={styles.treePanel}>
          <TvGroupAccordion group={expandedGroup} defaultExpanded isPublicView={isPublicView} />
        </div>
      )}
    </>
  );
}
