'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Edit2, Film, Tv } from 'lucide-react';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { TIER_CONFIG } from '@/lib/utils/tiers';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking } from '@/types';
import { tmdbImage } from '@/lib/tmdb/client';
import DeleteRankingButton from './DeleteRankingButton';
import styles from './TvGroupAccordion.module.css';

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

function TierPill({ tier }: { tier: string }) {
  const cfg = TIER_CONFIG[tier as TierType];
  if (!cfg) return null;
  const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
  return (
    <span
      className={styles.tierPill}
      style={{ color: cfg.color, background: cfg.bgColor, borderColor: `${cfg.color}40` }}
    >
      {Icon && <Icon size={10} />}
      {cfg.label}
    </span>
  );
}

export default function TvGroupAccordion({ group }: { group: TvGroupData }) {
  const [expanded, setExpanded] = useState(false);

  const posterUrl = tmdbImage(group.showPoster, 'w342');
  const showHref = `/title/tv/${group.tmdbId}`;

  // How many ranked items inside (seasons + episodes)
  const innerCount = group.seasons.length + group.episodes.length;

  // Group episodes by season
  const episodesBySeason = group.episodes.reduce<Record<number, Ranking[]>>((acc, ep) => {
    const sn = ep.season_number ?? 0;
    if (!acc[sn]) acc[sn] = [];
    acc[sn].push(ep);
    return acc;
  }, {});

  return (
    <div className={styles.accordion}>
      {/* ── Collapsed card (always visible) ────────── */}
      <div className={styles.card}>
        {/* Poster */}
        <Link href={showHref} className={styles.posterLink}>
          <div className={styles.poster}>
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={group.showTitle}
                fill
                sizes="160px"
                className={styles.posterImg}
              />
            ) : (
              <div className={styles.posterPlaceholder}><Tv size={28} strokeWidth={1} /></div>
            )}
            {/* Tier badge only if the SHOW itself is ranked */}
            {group.showRanking && (() => {
              const cfg = TIER_CONFIG[group.showRanking.tier as TierType];
              const Icon = cfg ? TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS] : null;
              return cfg ? (
                <div
                  className={styles.tierBadge}
                  style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: cfg.bgColor }}
                >
                  {Icon && <Icon size={11} />}
                  <span>{cfg.label}</span>
                </div>
              ) : null;
            })()}
          </div>
        </Link>

        {/* Info */}
        <div className={styles.info}>
          <Link href={showHref} className={styles.title}>{group.showTitle}</Link>
          <div className={styles.meta}>
            {group.showYear && <span>{group.showYear}</span>}
            <span className={styles.typePill}>TV</span>
          </div>

          {/* Show tags if the show itself is ranked */}
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

        {/* Actions */}
        <div className={styles.actions}>
          {group.showRanking && (
            <>
              <Link href={showHref} className={`btn btn-ghost btn-sm ${styles.editBtn}`}>
                <Edit2 size={13} />
              </Link>
              <DeleteRankingButton id={group.showRanking.id} title={group.showTitle} />
            </>
          )}
          {/* Expand toggle — only if there are inner rankings */}
          {innerCount > 0 && (
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${styles.expandBtn}`}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse' : `Show ${innerCount} ranked season${innerCount !== 1 ? 's/episodes' : '/episode'}`}
              title={expanded ? 'Collapse' : `${innerCount} item${innerCount !== 1 ? 's' : ''} ranked`}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded: seasons + episodes ─────────────── */}
      {expanded && (
        <div className={styles.expandedBody}>
          {/* Ranked seasons */}
          {group.seasons.map((s) => (
            <div key={s.id} className={styles.subRow}>
              <Link
                href={`/title/tv/${group.tmdbId}/season/${s.season_number}`}
                className={styles.subLink}
              >
                Season {s.season_number}
              </Link>
              <TierPill tier={s.tier} />
              {s.tags && (s.tags as string[]).length > 0 && (
                <div className={styles.subTags}>
                  {(s.tags as string[]).slice(0, 2).map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
              <div className={styles.subActions}>
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

          {/* Ranked episodes grouped by season */}
          {Object.entries(episodesBySeason).map(([sn, eps]) => (
            <div key={sn}>
              <div className={styles.seasonLabel}>Season {sn} Episodes</div>
              {eps.map((ep) => (
                <div key={ep.id} className={styles.subRow}>
                  <Link
                    href={`/title/tv/${group.tmdbId}/season/${ep.season_number}/episode/${ep.episode_number}`}
                    className={styles.subLink}
                  >
                    E{ep.episode_number} · {ep.title}
                  </Link>
                  <TierPill tier={ep.tier} />
                  <div className={styles.subActions}>
                    <DeleteRankingButton id={ep.id} title={ep.title} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
