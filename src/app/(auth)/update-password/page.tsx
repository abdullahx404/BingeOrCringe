'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/auth/actions';
import { validatePassword } from '@/lib/utils/validators';
import styles from '../signup/page.module.css';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleBlur() {
    const err = validatePassword(newPassword).error;
    if (err) setPasswordError(err);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const err = validatePassword(newPassword).error;
    if (err) {
      setPasswordError(err);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(newPassword);
      
      if (result?.error) {
        setServerError(result.error);
      } else {
        setServerSuccess('Password updated successfully. Redirecting to your dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Set New Password</h1>
        <p className={styles.subtitle}>Please enter your new password below.</p>
      </div>

      {serverError && (
        <div className={styles.errorBanner} role="alert">{serverError}</div>
      )}
      
      {serverSuccess && (
        <div className={styles.errorBanner} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', borderColor: 'rgba(34, 197, 94, 0.2)' }} role="alert">
          {serverSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className="form-group">
          <label htmlFor="new-password" className="form-label">New Password</label>
          <input
            id="new-password" name="newPassword" type="password"
            autoComplete="new-password" placeholder="Your new password"
            value={newPassword} 
            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(undefined); }} 
            onBlur={handleBlur}
            className={`form-input ${passwordError ? styles.inputError : ''}`}
            aria-describedby={passwordError ? 'new-password-error' : undefined}
            aria-invalid={!!passwordError}
          />
          {passwordError && (
            <p id="new-password-error" className="form-error">{passwordError}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
          <input
            id="confirm-password" name="confirmPassword" type="password"
            autoComplete="new-password" placeholder="Confirm new password"
            value={confirmPassword} 
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(undefined); }}
            className={`form-input ${passwordError ? styles.inputError : ''}`}
          />
        </div>

        <button
          type="submit" disabled={isPending || !!serverSuccess}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
