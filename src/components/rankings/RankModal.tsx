'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { X, Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createRanking, updateRanking } from '@/lib/rankings/actions';
import { getLists, addToList, removeFromList } from '@/lib/lists/actions';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import { TAGS } from '@/lib/utils/tags';
import type { TierType } from '@/lib/utils/tiers';
import type { Ranking, CustomList } from '@/types';
import Portal from './Portal';
import styles from './RankModal.module.css';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;
const MAX_TAGS = 3;

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
  existing?: Ranking | null;
  onClose: () => void;
  onSuccess?: (savedRank: Ranking | null) => void;
}

export default function RankModal({ media, existing, onClose, onSuccess }: Props) {
  const [selectedTier, setSelectedTier] = useState<TierType | null>(existing?.tier ?? null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (existing?.tags ?? []).slice(0, MAX_TAGS) as string[]
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [userLists, setUserLists] = useState<CustomList[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadLists() {
      const res = await getLists();
      if (res.data) setUserLists(res.data);
    }
    loadLists();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  }

  function handleSubmit() {
    if (!selectedTier) {
      setError('Pick a tier to save your ranking.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('tmdb_id', String(media.tmdb_id));
      formData.append('media_type', media.media_type);
      formData.append('title', media.title);
      formData.append('tier', selectedTier);
      formData.append('tags', JSON.stringify(selectedTags.slice(0, MAX_TAGS)));
      if (media.poster_path) formData.append('poster_path', media.poster_path);
      if (media.year) formData.append('year', media.year);
      if (media.season_number != null)
        formData.append('season_number', String(media.season_number));
      if (media.episode_number != null)
        formData.append('episode_number', String(media.episode_number));

      const action = existing ? updateRanking.bind(null, existing.id) : createRanking;
      const result = await action(formData);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        const ranking = result.data;
        if (ranking) {
          // Add to selected lists
          for (const listId of Array.from(selectedListIds)) {
            await addToList(listId, ranking.id);
          }
        }
        toast.success(`Saved "${media.title}" as ${TIER_CONFIG[selectedTier].label}`);
        onSuccess?.(ranking);
        onClose();
      }
    });
  }

  const mediaTypeLabel =
    media.media_type === 'movie' ? 'Movie'
    : media.media_type === 'tv' ? 'TV Show'
    : media.media_type === 'season' ? 'Season'
    : 'Episode';

  return (
    <Portal>
      <div
        className={styles.overlay}
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={`Rank ${media.title}`}
      >
        <div className={styles.modal}>

          {/* Sticky Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Crown size={16} className={styles.headerIcon} />
              <span>{existing ? 'Edit Ranking' : 'Rank This'}</span>
            </div>
            <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className={styles.body}>
            <div className={styles.mediaInfo}>
              <p className={styles.mediaTitle}>{media.title}</p>
              <div className={styles.mediaMeta}>
                {media.year && <span className={styles.mediaYear}>{media.year}</span>}
                <span className={styles.mediaType}>{mediaTypeLabel}</span>
              </div>
            </div>

            {/* Tier selector */}
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Tier</p>
              <div className={styles.tierGrid}>
                {TIERS.map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={styles.tierBtn}
                      style={{
                        color: isSelected ? cfg.color : undefined,
                        borderColor: isSelected ? cfg.color : undefined,
                        background: isSelected ? cfg.bgColor : undefined,
                      }}
                      aria-pressed={isSelected}
                    >
                      {Icon && <Icon size={16} />}
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedTier && (
                <p className={styles.tierDesc}>{TIER_CONFIG[selectedTier].description}</p>
              )}
            </div>

            {/* Tags */}
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Tags{' '}
                <span className={styles.optional}>
                  (optional · {selectedTags.length}/{MAX_TAGS} max)
                </span>
              </p>
              <div className={styles.tagsGrid}>
                {TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={isDisabled}
                      className={`${styles.tagBtn} ${isSelected ? styles.tagBtnSelected : ''} ${isDisabled ? styles.tagBtnDisabled : ''}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Lists */}
            {userLists.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Add to Custom Lists <span className={styles.optional}>(optional)</span></p>
                <div className={styles.tagsGrid}>
                  {userLists.map((list) => {
                    const isSelected = selectedListIds.has(list.id);
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => setSelectedListIds(prev => {
                          const next = new Set(prev);
                          if (next.has(list.id)) next.delete(list.id);
                          else next.add(list.id);
                          return next;
                        })}
                        className={`${styles.tagBtn} ${isSelected ? styles.tagBtnSelected : ''}`}
                      >
                        {list.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {error && (
              <p className={styles.error} role="alert">{error}</p>
            )}
          </div>

          {/* Sticky Footer */}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !selectedTier}
              className="btn btn-primary"
            >
              {isPending ? 'Saving…' : existing ? 'Update Ranking' : 'Save Ranking'}
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
