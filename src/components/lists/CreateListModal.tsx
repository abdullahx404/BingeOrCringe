'use client';

import { useState, useTransition } from 'react';
import { createList } from '@/lib/lists/actions';
import styles from './CreateListModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('List name is required.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('is_public', isPublic.toString());
      
      const res = await createList(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setName('');
        setIsPublic(true);
        onClose();
      }
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        
        <h2 className={styles.title}>Create New List</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="list-name" className="form-label">List Name</label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g., Horror Favorites"
              maxLength={50}
              required
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <strong className={styles.label}>Public List</strong>
              <p className={styles.hint}>Allow anyone to view this list.</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
