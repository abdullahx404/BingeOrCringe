'use client';

import { useState, useTransition } from 'react';
import { updateProfile, type ProfileUpdateData } from '@/lib/profile/actions';
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
        if (formData.username !== initialData.username) {
          // If username changed, redirect to new profile URL to avoid 404
          window.location.href = `/u/${formData.username}`;
        } else {
          setTimeout(() => setSuccess(false), 3000);
        }
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
    </form>
  );
}
