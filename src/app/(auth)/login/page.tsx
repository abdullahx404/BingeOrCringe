'use client';

import { Suspense } from 'react';
import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { logIn, signInWithGoogle } from '@/lib/auth/actions';
import { validateEmail, validatePassword } from '@/lib/utils/validators';
import styles from '../signup/page.module.css';

/* ─── Inner form — needs Suspense because of useSearchParams ─ */
function LoginForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [fields, setFields] = useState({ email: '', password: '' });

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setServerError('Google sign-in failed. Please try again.');
    }
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === 'email') {
      const err = validateEmail(value).error;
      if (err) setFieldErrors((prev) => ({ ...prev, email: err }));
    }
    if (name === 'password') {
      const err = validatePassword(value).error;
      if (err) setFieldErrors((prev) => ({ ...prev, password: err }));
    }
  }

  async function handleGoogleSignIn() {
    const result = await signInWithGoogle();
    if (result.error) { setServerError(result.error); return; }
    if (result.data?.url) window.location.href = result.data.url;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const emailErr = validateEmail(fields.email).error;
    const passwordErr = validatePassword(fields.password).error;
    if (emailErr || passwordErr) {
      setFieldErrors({ email: emailErr, password: passwordErr });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', fields.email.trim());
      formData.append('password', fields.password);
      // Pass the redirect target so the server action can send the user back
      const nextUrl = searchParams.get('next') ?? '';
      if (nextUrl) formData.append('next', nextUrl);
      const result = await logIn(formData);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Your rankings are waiting. Log back in.</p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className={`btn btn-secondary ${styles.oauthBtn}`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      {serverError && (
        <div className={styles.errorBanner} role="alert">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input
            id="login-email" name="email" type="email"
            autoComplete="email" placeholder="you@example.com"
            value={fields.email} onChange={handleChange} onBlur={handleBlur}
            className={`form-input ${fieldErrors.email ? styles.inputError : ''}`}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="form-error">{fieldErrors.email}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">Password</label>
          <input
            id="login-password" name="password" type="password"
            autoComplete="current-password" placeholder="Your password"
            value={fields.password} onChange={handleChange} onBlur={handleBlur}
            className={`form-input ${fieldErrors.password ? styles.inputError : ''}`}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
            {fieldErrors.password ? (
              <p id="login-password-error" className="form-error">{fieldErrors.password}</p>
            ) : <span />}
            <Link href="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Forgot password?</Link>
          </div>
        </div>

        <button
          type="submit" disabled={isPending}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {isPending ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className={styles.switchAuth}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className={styles.switchLink}>Sign up free</Link>
      </p>
    </div>
  );
}

/* ─── Page export — wraps LoginForm in Suspense ─────────── */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.card}>
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
