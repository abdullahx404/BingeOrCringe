'use client';

import { useState, useTransition } from 'react';
import { deleteAccount } from '@/lib/profile/actions';
import styles from './ProfileSettingsForm.module.css';

export default function DeleteAccountSection() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <>
      <div className={styles.dangerZoneCard}>
        <h3 className={styles.dangerTitle}>Delete Account</h3>
        <p className={styles.dangerDesc}>
          This action cannot be undone. All your rankings, custom lists, messages, and followers will be permanently wiped from our servers immediately.
        </p>
        <button 
          type="button" 
          onClick={() => setShowDeleteModal(true)} 
          className="btn btn-danger"
          style={{ width: 'fit-content', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold' }}
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Delete Account</h2>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete your account?
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
                style={{ backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold' }}
                onClick={() => {
                  setDeleteError(null);
                  startDeleteTransition(async () => {
                    const res = await deleteAccount();
                    if (res.error) {
                      setDeleteError(res.error);
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
    </>
  );
}
