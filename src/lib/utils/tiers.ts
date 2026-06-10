export const TIERS = ['goated', 'binge', 'mid', 'cringe', 'trash'] as const;

export type Tier = (typeof TIERS)[number];

export const TIER_CONFIG: Record<
  Tier,
  { label: string; emoji: string; color: string; bgColor: string; description: string }
> = {
  goated: {
    label: 'Goated',
    emoji: '🐐',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.12)',
    description: 'Masterpiece. Peak cinema. No debate.',
  },
  binge: {
    label: 'Binge',
    emoji: '🍿',
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    description: 'Solid watch. Would recommend.',
  },
  mid: {
    label: 'Mid',
    emoji: '😐',
    color: '#9CA3AF',
    bgColor: 'rgba(156, 163, 175, 0.12)',
    description: 'It exists. Nothing special.',
  },
  cringe: {
    label: 'Cringe',
    emoji: '😬',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    description: 'Bad, but you watched it anyway.',
  },
  trash: {
    label: 'Trash',
    emoji: '🗑️',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    description: 'Absolute waste of time.',
  },
};

export function isValidTier(value: string): value is Tier {
  return TIERS.includes(value as Tier);
}

export function getTierConfig(tier: Tier) {
  return TIER_CONFIG[tier];
}
