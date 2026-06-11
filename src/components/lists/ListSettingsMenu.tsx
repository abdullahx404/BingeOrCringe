'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Trash2, Globe, Lock } from 'lucide-react';
import { updateList, deleteList } from '@/lib/lists/actions';
import { toast } from 'sonner';

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
              background: 'var(--bg-surface)',
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
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          padding: 'var(--space-4)'
        }}>
          <div style={{
            background: 'var(--bg-surface)', padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
            maxWidth: '400px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Delete List</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
              Are you sure you want to delete &quot;{listName}&quot;? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={isPending}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--color-trash)', borderColor: 'var(--color-trash)', color: '#fff' }} 
                onClick={confirmDelete} 
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
