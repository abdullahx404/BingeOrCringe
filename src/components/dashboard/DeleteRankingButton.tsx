'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteRanking } from '@/lib/rankings/actions';
import styles from './DeleteRankingButton.module.css';

interface Props {
  id: string;
  title: string;
}

export default function DeleteRankingButton({ id, title }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      // Auto-reset after 3s
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    startTransition(async () => {
      await deleteRanking(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`btn btn-ghost btn-sm ${styles.btn} ${confirming ? styles.confirming : ''}`}
      aria-label={confirming ? `Confirm delete ${title}` : `Delete ${title}`}
      title={confirming ? 'Click again to confirm' : 'Remove from collection'}
    >
      {isPending ? (
        <span className={styles.spinner} />
      ) : (
        <Trash2 size={13} />
      )}
    </button>
  );
}
