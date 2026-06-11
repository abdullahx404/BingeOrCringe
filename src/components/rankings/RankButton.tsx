'use client';

import { useState } from 'react';
import { Crown, CheckCircle, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Ranking } from '@/types';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import styles from './RankButton.module.css';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

// Lazy load modal to avoid loading on first paint
const RankModal = dynamic(() => import('./RankModal'), { ssr: false });

interface Props {
  media: {
    tmdb_id: number;
    media_type: 'movie' | 'tv' | 'season' | 'episode';
    season_number?: number;
    episode_number?: number;
    title: string;
    poster_path: string | null;
    year: string | null;
  };
  /** Pass in the user's existing ranking if already ranked */
  existing?: Ranking | null;
}

export default function RankButton({ media, existing }: Props) {
  const [open, setOpen] = useState(false);
  // Track the actual ranking object so it updates seamlessly when saved without waiting for refresh
  const [currentRank, setCurrentRank] = useState<Ranking | null>(existing || null);

  const label = currentRank
    ? 'Edit Ranking'
    : `Rank This ${media.media_type === 'movie' ? 'Movie' : media.media_type === 'tv' ? 'Show' : media.media_type === 'season' ? 'Season' : 'Episode'}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn ${currentRank ? 'btn-secondary' : 'btn-primary'} ${styles.btn}`}
        id={`rank-btn-${media.tmdb_id}`}
      >
        {!currentRank ? (
          <Crown size={16} />
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: TIER_CONFIG[currentRank.tier as keyof typeof TIER_CONFIG].bgColor,
            color: TIER_CONFIG[currentRank.tier as keyof typeof TIER_CONFIG].color,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            gap: '4px',
            border: `1px solid ${TIER_CONFIG[currentRank.tier as keyof typeof TIER_CONFIG].color}40`,
          }}>
            {(() => {
              const Icon = TIER_ICONS[TIER_CONFIG[currentRank.tier as keyof typeof TIER_CONFIG].icon as keyof typeof TIER_ICONS];
              return Icon ? <Icon size={12} /> : null;
            })()}
            {currentRank.tier}
          </span>
        )}
        {label}
      </button>

      {open && (
        <RankModal
          media={media}
          existing={currentRank}
          onClose={() => setOpen(false)}
          onSuccess={(savedRank: Ranking | null) => {
            setCurrentRank(savedRank);
          }}
        />
      )}
    </>
  );
}
