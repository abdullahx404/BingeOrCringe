'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Edit2, Tv } from 'lucide-react';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/utils/tiers';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import { tmdbImage } from '@/lib/tmdb/client';
import DeleteRankingButton from './DeleteRankingButton';
import styles from '../../app/dashboard/page.module.css';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

export interface TvGroupData {
  tmdbId: number;
  showTitle: string;
  showPoster: string | null;
  showYear: string | null;
  showRanking: Ranking | null;
  seasons: Ranking[];
  episodes: Ranking[];
}

function InlineTierPill({ tier }: { tier: string }) {
  const cfg = TIER_CONFIG[tier as TierType];
  if (!cfg) return null;
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

export default function TvGroupAccordion({
  group,
  defaultExpanded = false,
  isPublicView,
}: {
  group: TvGroupData;
  defaultExpanded?: boolean;
  isPublicView?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const posterUrl = tmdbImage(group.showPoster, 'w342');
  const showHref = `/title/tv/${group.tmdbId}`;

  const innerCount = group.seasons.length + group.episodes.length;

  // Group episodes by season number
  const episodesBySeason = group.episodes.reduce<Record<number, Ranking[]>>((acc, ep) => {
    const sn = ep.season_number ?? 0;
    if (!acc[sn]) acc[sn] = [];
    acc[sn].push(ep);
    return acc;
  }, {});

  return (
    <div className={styles.tvGroup}>
      {/* ── Show header row ─────────────────── */}
      <div className={styles.tvShowRow}>
        {/* Small poster */}
        <Link href={showHref} className={styles.tvPosterLink}>
          <div className={styles.tvPoster}>
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={group.showTitle}
                fill
                sizes="60px"
                className={styles.tvPosterImg}
              />
            ) : (
              <div className={styles.tvPosterPlaceholder}>
                <Tv size={20} strokeWidth={1} />
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className={styles.tvShowInfo}>
          <Link href={showHref} className={styles.tvShowTitle}>
            {group.showTitle}
          </Link>
          <div className={styles.tvShowMeta}>
            {group.showYear && <span>{group.showYear}</span>}
            <span>TV</span>
            {group.showRanking && <InlineTierPill tier={group.showRanking.tier} />}
          </div>
          {group.showRanking?.tags && (group.showRanking.tags as string[]).length > 0 && (
            <div className={styles.tvTags}>
              {(group.showRanking.tags as string[]).slice(0, 3).map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.tvActions}>
          {!isPublicView && group.showRanking && (
            <>
              <Link href={showHref} className={styles.overlayBtn} title="Edit ranking">
                <Edit2 size={14} />
              </Link>
              <DeleteRankingButton id={group.showRanking.id} title={group.showTitle} btnClassName={styles.overlayDeleteBtn} />
            </>
          )}
          {/* Expand chevron */}
          {innerCount > 0 && (
            <button
              type="button"
              className={styles.expandBtn}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse' : `Show ${innerCount} ranked item${innerCount !== 1 ? 's' : ''}`}
            >
              {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded tree: seasons + episodes ─── */}
      {expanded && (
        <div className={styles.tvSubList}>
          {/* Ranked seasons */}
          {group.seasons.map((s) => (
            <div key={s.id} className={styles.tvSubRow}>
              <Link
                href={`/title/tv/${group.tmdbId}/season/${s.season_number}`}
                className={styles.tvSubLink}
              >
                Season {s.season_number}
              </Link>
              <InlineTierPill tier={s.tier} />
              {s.tags && (s.tags as string[]).length > 0 && (
                <div className={styles.tvSubTags}>
                  {(s.tags as string[]).slice(0, 2).map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
              {!isPublicView && (
                <div className={styles.tvSubActions}>
                  <Link
                    href={`/title/tv/${group.tmdbId}/season/${s.season_number}`}
                    className={styles.overlayBtn}
                  >
                    <Edit2 size={14} />
                  </Link>
                  <DeleteRankingButton id={s.id} title={`Season ${s.season_number}`} btnClassName={styles.overlayDeleteBtn} />
                </div>
              )}
            </div>
          ))}

          {/* Ranked episodes grouped under "Season X Episodes" label */}
          {Object.entries(episodesBySeason).map(([sn, eps]) => (
            <div key={sn}>
              <div className={styles.tvSeasonLabel}>Season {sn} Episodes</div>
              {eps.map((ep) => (
                <div key={ep.id} className={styles.tvSubRow}>
                  <Link
                    href={`/title/tv/${group.tmdbId}/season/${ep.season_number}/episode/${ep.episode_number}`}
                    className={styles.tvSubLink}
                  >
                    E{ep.episode_number} &middot; {ep.title}
                  </Link>
                  <InlineTierPill tier={ep.tier} />
                  {!isPublicView && (
                    <div className={styles.tvSubActions}>
                      <DeleteRankingButton id={ep.id} title={ep.title} btnClassName={styles.overlayDeleteBtn} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
