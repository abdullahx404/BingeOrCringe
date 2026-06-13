'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Trash2, Globe, Lock } from 'lucide-react';
import { updateList, deleteList } from '@/lib/lists/actions';
import { toast } from 'sonner';
import modalStyles from '../dashboard/DeleteRankingButton.module.css';

interface Props {
  listId: string;
  listName: string;
  isPublic: boolean;
}

export default function ListSettingsMenu({ listId, listName, isPublic }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function togglePrivacy() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', listName);
      formData.append('is_public', (!isPublic).toString());
      
      const res = await updateList(listId, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`List is now ${!isPublic ? 'Public' : 'Private'}`);
      }
      setIsOpen(false);
    });
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteList(listId);
      if (res.error) {
        toast.error(res.error);
        setShowDeleteModal(false);
      } else {
        toast.success('List deleted.');
        router.push('/dashboard');
      }
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="btn btn-secondary btn-sm"
        disabled={isPending}
        aria-label="List Settings"
      >
        <Settings size={16} />
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2)',
              minWidth: '200px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button 
              onClick={togglePrivacy}
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {isPublic ? <Lock size={14} /> : <Globe size={14} />}
              Make {isPublic ? 'Private' : 'Public'}
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: 'var(--space-2) var(--space-3)', textAlign: 'left',
                background: 'transparent', border: 'none', color: 'var(--color-trash)',
                cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={14} />
              Delete List
            </button>
          </div>
        </>
      )}

      {showDeleteModal && (
        <div 
          className={modalStyles.overlay}
          onClick={() => !isPending && setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.modalIconWrap}>
              <Trash2 size={28} className={modalStyles.modalIcon} />
            </div>

            <h2 className={modalStyles.modalTitle}>Delete List</h2>
            <p className={modalStyles.modalDesc}>
              Are you sure you want to delete <strong>&ldquo;{listName}&rdquo;</strong>? This action cannot be undone.
            </p>

            <div className={modalStyles.modalActions}>
              <button 
                type="button"
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                type="button"
                className={`btn ${modalStyles.removeBtn}`} 
                onClick={confirmDelete} 
                disabled={isPending}
              >
                {isPending ? (
                  <span className={modalStyles.spinner} />
                ) : (
                  <Trash2 size={15} />
                )}
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
