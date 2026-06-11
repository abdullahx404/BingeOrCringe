'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { TIERS, TIER_CONFIG } from '@/lib/utils/tiers';
import type { TierType } from '@/lib/utils/tiers';
import styles from './TierFilterTabs.module.css';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

interface Props {
  activeTier?: TierType;
  countByTier: Record<string, number>;
  total: number;
}

export default function TierFilterTabs({ activeTier, countByTier, total }: Props) {
  const pathname = usePathname();
  
  return (
    <div className={styles.tabs}>
      {/* All */}
      <Link
        href={pathname}
        className={`${styles.tab} ${!activeTier ? styles.tabActive : ''}`}
      >
        <span>All</span>
        <span className={styles.count}>{total}</span>
      </Link>

      {TIERS.map((tier) => {
        const cfg = TIER_CONFIG[tier];
        const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
        const isActive = activeTier === tier;
        return (
          <Link
            key={tier}
            href={`${pathname}?tier=${tier}`}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            style={{
              borderColor: cfg.color,
              color: isActive ? cfg.color : undefined,
              backgroundColor: isActive ? `${cfg.color}15` : undefined
            }}
          >
            {Icon && <Icon size={14} style={{ color: isActive ? cfg.color : cfg.color }} />}
            <span>{cfg.label}</span>
            {countByTier[tier] > 0 && (
              <span className={styles.count}>{countByTier[tier]}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
