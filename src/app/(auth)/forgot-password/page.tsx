'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { validateEmail } from '@/lib/utils/validators';
import { resetPassword } from '@/lib/auth/actions';
import styles from '../signup/page.module.css';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [email, setEmail] = useState('');

  function handleBlur() {
    const err = validateEmail(email).error;
    if (err) setEmailError(err);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const err = validateEmail(email).error;
    if (err) {
      setEmailError(err);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email.trim());
      const result = await resetPassword(formData);
      
      if (result?.error) {
        setServerError(result.error);
      } else {
        setServerSuccess('If an account exists, a password reset link has been sent to that email. This can take up to 2 minutes.');
      }
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter your email to receive a password reset link. It may take up to 2 minutes to arrive.</p>
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
          <label htmlFor="reset-email" className="form-label">Email</label>
          <input
            id="reset-email" name="email" type="email"
            autoComplete="email" placeholder="you@example.com"
            value={email} 
            onChange={(e) => { setEmail(e.target.value); setEmailError(undefined); }} 
            onBlur={handleBlur}
            className={`form-input ${emailError ? styles.inputError : ''}`}
            aria-describedby={emailError ? 'reset-email-error' : undefined}
            aria-invalid={!!emailError}
          />
          {emailError && (
            <p id="reset-email-error" className="form-error">{emailError}</p>
          )}
        </div>

        <button
          type="submit" disabled={isPending || !!serverSuccess}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className={styles.switchAuth}>
        Remembered your password?{' '}
        <Link href="/login" className={styles.switchLink}>Log in here</Link>
      </p>
    </div>
  );
}
