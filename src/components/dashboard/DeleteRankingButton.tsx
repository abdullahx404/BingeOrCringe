'use client';

import { useState, useTransition } from 'react';
import { Trash2, X, Check } from 'lucide-react';
import { deleteRanking } from '@/lib/rankings/actions';
import styles from './DeleteRankingButton.module.css';

interface Props {
  id: string;
  title: string;
}

export default function DeleteRankingButton({ id, title }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDeleteClick() {
    setConfirming(true);
  }

  function handleCancel() {
    setConfirming(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      await deleteRanking(id);
    });
  }

  if (confirming && !isPending) {
    return (
      <span className={styles.confirmRow}>
        <span className={styles.confirmLabel}>Remove?</span>
        <button
          type="button"
          onClick={handleConfirm}
          className={`btn btn-ghost btn-sm ${styles.confirmYes}`}
          title="Yes, remove"
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={`btn btn-ghost btn-sm ${styles.confirmNo}`}
          title="Cancel"
        >
          <X size={13} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDeleteClick}
      disabled={isPending}
      className={`btn btn-ghost btn-sm ${styles.btn}`}
      aria-label={`Remove ${title} from collection`}
      title="Remove from collection"
    >
      {isPending ? (
        <span className={styles.spinner} />
      ) : (
        <Trash2 size={13} />
      )}
    </button>
  );
}
