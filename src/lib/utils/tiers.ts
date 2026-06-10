export type TierType = 'goated' | 'binge' | 'mid' | 'cringe' | 'trash';

export interface TierConfig {
  label: string;
  /** Lucide icon component name */
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const TIERS: TierType[] = ['goated', 'binge', 'mid', 'cringe', 'trash'];

export const TIER_CONFIG: Record<TierType, TierConfig> = {
  goated: {
    label: 'Goated',
    icon: 'Crown',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.08)',
    description: 'Absolute cinema. Watch it twice.',
  },
  binge: {
    label: 'Binge',
    icon: 'Play',
    color: '#4ADE80',
    bgColor: 'rgba(74, 222, 128, 0.08)',
    description: 'Easy recommend. You know what it is.',
  },
  mid: {
    label: 'Mid',
    icon: 'Minus',
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.08)',
    description: 'It exists. You watched it.',
  },
  cringe: {
    label: 'Cringe',
    icon: 'ThumbsDown',
    color: '#FB923C',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    description: 'Hard to sit through. You did it though.',
  },
  trash: {
    label: 'Trash',
    icon: 'Trash2',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    description: 'Genuinely awful. No notes.',
  },
};

export function isValidTier(value: string): value is TierType {
  return TIERS.includes(value as TierType);
}

export function getTierConfig(tier: TierType): TierConfig {
  return TIER_CONFIG[tier];
}
