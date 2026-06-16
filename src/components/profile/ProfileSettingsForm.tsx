'use client';

import { useState, useTransition } from 'react';
import { updateProfile, deleteAccount, type ProfileUpdateData } from '@/lib/profile/actions';
import { useRouter } from 'next/navigation';
import styles from './ProfileSettingsForm.module.css';

interface Props {
  initialData: ProfileUpdateData;
}

export default function ProfileSettingsForm({ initialData }: Props) {
  const [formData, setFormData] = useState<ProfileUpdateData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label htmlFor="display_name" className={styles.label}>Display Name</label>
          <input
            id="display_name"
            type="text"
            required
            className={styles.input}
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            required
            pattern="^[a-z0-9._]{3,20}$"
            title="3-20 characters. Lowercase letters, numbers, dots, and underscores only"
            className={styles.input}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
          />
          <p className={styles.hint}>3-20 characters. Lowercase letters, numbers, dots, and underscores.</p>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.toggleText}>
          <strong className={styles.label}>Public Profile</strong>
          <p className={styles.hint}>Allow anyone to view your profile and rankings.</p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Profile updated successfully!</div>}

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Danger Zone</h3>
        <p className={styles.dangerDesc}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button 
          type="button" 
          onClick={() => setShowDeleteModal(true)} 
          className="btn btn-danger"
          style={{ width: 'fit-content' }}
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Delete Account</h2>
            <p className={styles.modalText}>
              Are you absolutely sure you want to permanently delete your account?
            </p>
            <p className={styles.modalWarning}>
              This action <strong>cannot be undone</strong>. All your rankings, custom lists, messages, and followers will be permanently wiped from our servers immediately.
            </p>
            
            {deleteError && <div className={styles.error}>{deleteError}</div>}
            
            <div className={styles.modalActions}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                disabled={isDeleting}
                onClick={() => {
                  setDeleteError(null);
                  startDeleteTransition(async () => {
                    const res = await deleteAccount();
                    if (res.error) {
                      setDeleteError(res.error);
                    } else {
                      router.push('/');
                    }
                  });
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
