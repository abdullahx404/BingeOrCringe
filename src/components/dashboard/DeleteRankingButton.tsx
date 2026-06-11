'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { deleteRanking } from '@/lib/rankings/actions';
import styles from './DeleteRankingButton.module.css';

interface Props {
  id: string;
  title: string;
  btnClassName?: string; // optional — caller can supply glass-style class
}

export default function DeleteRankingButton({ id, title, btnClassName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleConfirm() {
    startTransition(async () => {
      const res = await deleteRanking(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Removed "${title}" from your collection`);
        setShowModal(false);
      }
    });
  }

  const modalContent = showModal ? (
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
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={btnClassName ?? styles.btn}
        aria-label={`Remove ${title} from collection`}
        title="Remove from collection"
      >
        <Trash2 size={14} />
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
