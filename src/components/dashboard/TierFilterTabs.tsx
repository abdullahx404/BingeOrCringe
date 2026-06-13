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
        className={`${styles.tab} ${styles.tierTab} ${!activeTier ? styles.tabActive : ''}`}
        style={{ '--tab-color': 'var(--accent)' } as React.CSSProperties}
      >
        <span>All</span>
        <span className={`${styles.count} ${!activeTier ? styles.countActive : ''}`}>{total}</span>
      </Link>

      {TIERS.map((tier) => {
        const cfg = TIER_CONFIG[tier];
        const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
        const isActive = activeTier === tier;
        return (
          <Link
            key={tier}
            href={`${pathname}?tier=${tier}`}
            className={`${styles.tab} ${styles.tierTab} ${isActive ? styles.tabActive : ''}`}
            style={{ '--tab-color': cfg.color } as React.CSSProperties}
          >
            {Icon && <Icon size={14} className={styles.tabIcon} />}
            <span>{cfg.label}</span>
            {countByTier[tier] > 0 && (
              <span className={`${styles.count} ${isActive ? styles.countActive : ''}`}>{countByTier[tier]}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
