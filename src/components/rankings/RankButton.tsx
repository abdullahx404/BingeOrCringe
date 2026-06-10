'use client';

import { useState } from 'react';
import { Crown, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Ranking } from '@/types';
import styles from './RankButton.module.css';

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
  const [ranked, setRanked] = useState(!!existing);

  const label = ranked
    ? 'Edit Ranking'
    : `Rank This ${media.media_type === 'movie' ? 'Movie' : media.media_type === 'tv' ? 'Show' : media.media_type === 'season' ? 'Season' : 'Episode'}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn ${ranked ? 'btn-secondary' : 'btn-primary'} ${styles.btn}`}
        id={`rank-btn-${media.tmdb_id}`}
      >
        {ranked ? <CheckCircle size={16} /> : <Crown size={16} />}
        {label}
      </button>

      {open && (
        <RankModal
          media={media}
          existing={ranked ? existing : null}
          onClose={() => setOpen(false)}
          onSuccess={() => setRanked(true)}
        />
      )}
    </>
  );
}
