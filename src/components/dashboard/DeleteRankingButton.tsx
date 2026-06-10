'use client';

import { useState, useTransition } from 'react';
import { Trash2, X } from 'lucide-react';
import { deleteRanking } from '@/lib/rankings/actions';
import styles from './DeleteRankingButton.module.css';

interface Props {
  id: string;
  title: string;
}

export default function DeleteRankingButton({ id, title }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteRanking(id);
      setShowModal(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={styles.btn}
        aria-label={`Remove ${title} from collection`}
        title="Remove from collection"
      >
        <Trash2 size={17} />
      </button>

      {showModal && (
        /* Click outside overlay to dismiss */
        <div
          className={styles.overlay}
          onClick={() => !isPending && setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm removal"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIconWrap}>
              <Trash2 size={28} className={styles.modalIcon} />
            </div>

            <h2 className={styles.modalTitle}>Remove from Collection?</h2>
            <p className={styles.modalDesc}>
              <strong>&ldquo;{title}&rdquo;</strong> will be removed from your rankings. This can&apos;t be undone.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                No, Keep It
              </button>
              <button
                type="button"
                className={`btn ${styles.removeBtn}`}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <span className={styles.spinner} />
                ) : (
                  <Trash2 size={15} />
                )}
                {isPending ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>

            {/* Close X */}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
              disabled={isPending}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
