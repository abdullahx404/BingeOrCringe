'use client';

import { useState, useTransition } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';
import { updateProfile, type ProfileUpdateData } from '@/lib/profile/actions';
import styles from './ProfileSettingsForm.module.css';

interface Props {
  initialData: ProfileUpdateData;
}

export default function ProfileSettingsForm({ initialData }: Props) {
  const [formData, setFormData] = useState<ProfileUpdateData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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
      
      {/* Aesthetic Profile Photo Section */}
      <div className={styles.photoSection}>
        <div className={styles.avatarPreview}>
          {formData.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formData.avatar_url} alt="Avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>
              <User size={40} />
            </div>
          )}
        </div>
        <div className={styles.photoInputContainer}>
          <label htmlFor="avatar_url" className={styles.label}>Profile Photo URL</label>
          <div className={styles.inputWithIcon}>
            <ImageIcon size={18} className={styles.inputIcon} />
            <input
              id="avatar_url"
              type="url"
              placeholder="https://example.com/avatar.png"
              className={`input ${styles.iconInput}`}
              value={formData.avatar_url || ''}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            />
          </div>
          <p className={styles.hint}>Paste a link to an image to use as your avatar.</p>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label htmlFor="display_name" className={styles.label}>Display Name</label>
          <input
            id="display_name"
            type="text"
            required
            className="input"
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
            pattern="^[a-zA-Z0-9_]{3,20}$"
            title="3-20 characters, letters, numbers, and underscores only"
            className="input"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <p className={styles.hint}>3-20 characters. Letters, numbers, and underscores.</p>
        </div>
      </div>

      <hr className={styles.divider} />

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
