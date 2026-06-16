'use client';

import { useState, useTransition } from 'react';
import { changePasswordWithVerification } from '@/lib/auth/actions';
import { validatePassword } from '@/lib/utils/validators';
import styles from './ProfileSettingsForm.module.css'; // Reusing styles

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const passErr = validatePassword(newPassword).error;
    if (passErr) {
      setFieldErrors(prev => ({ ...prev, newPassword: passErr }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
      const res = await changePasswordWithVerification(formData);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGrid}>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="oldPassword" className={styles.label}>Old Password</label>
          <input
            id="oldPassword"
            type="password"
            required
            autoComplete="current-password"
            className={styles.input}
            placeholder="********"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="newPassword" className={styles.label}>New Password</label>
          <input
            id="newPassword"
            type="password"
            required
            autoComplete="new-password"
            className={styles.input}
            placeholder="********"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setFieldErrors(prev => ({...prev, newPassword: undefined})); }}
          />
          {fieldErrors.newPassword && <p className={styles.error} style={{ marginTop: '4px', padding: 'var(--space-2)' }}>{fieldErrors.newPassword}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={styles.input}
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({...prev, confirmPassword: undefined})); }}
          />
          {fieldErrors.confirmPassword && <p className={styles.error} style={{ marginTop: '4px', padding: 'var(--space-2)' }}>{fieldErrors.confirmPassword}</p>}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Password changed successfully!</div>}

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}
