'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle2, XCircle } from 'lucide-react';
import { signUp, signInWithGoogle } from '@/lib/auth/actions';
import {
  validateUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  type SignupFormErrors,
} from '@/lib/utils/validators';
import NProgress from 'nprogress';
import styles from './page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors & { terms?: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [fields, setFields] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    // Auto-lowercase username as the user types
    const processed = name === 'username' ? value.toLowerCase() : value;
    setFields((prev) => ({ ...prev, [name]: processed }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateField(name: string, value: string): string | undefined {
    if (name === 'username') return validateUsername(value).error;
    if (name === 'displayName') return validateDisplayName(value).error;
    if (name === 'email') return validateEmail(value).error;
    if (name === 'password') return validatePassword(value).error;
    return undefined;
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  }

  async function handleGoogleSignIn() {
    NProgress.start();
    const result = await signInWithGoogle();
    if (result.error) {
      setServerError(result.error);
      NProgress.done();
      return;
    }
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    // Client-side validation before submitting
    const newErrors: SignupFormErrors = {};
    const usernameErr = validateField('username', fields.username);
    const displayNameErr = validateField('displayName', fields.displayName);
    const emailErr = validateField('email', fields.email);
    const passwordErr = validateField('password', fields.password);

    if (usernameErr) newErrors.username = usernameErr;
    if (displayNameErr) newErrors.displayName = displayNameErr;
    if (emailErr) newErrors.email = emailErr;
    if (passwordErr) newErrors.password = passwordErr;

    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms and Conditions to sign up.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    NProgress.start();

    startTransition(async () => {
      const formData = new FormData();
      formData.append('username', fields.username.trim().toLowerCase());
      formData.append('displayName', fields.displayName.trim());
      formData.append('email', fields.email.trim());
      formData.append('password', fields.password);

      const result = await signUp(formData);

      if (result.error) {
        if (result.errors) {
          setErrors(result.errors as SignupFormErrors);
        } else {
          setServerError(result.error);
        }
        NProgress.done();
        return;
      }

      // Show "check your email" message
      setSuccess(true);
      NProgress.done();
    });
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successIcon}>
          <Mail size={40} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Check your inbox</h1>
        <p className={styles.subtitle}>
          We sent a confirmation link to <strong>{fields.email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className={`btn btn-secondary ${styles.backBtn}`}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Rank what you watch. Your taste, your rules.</p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className={`btn btn-secondary ${styles.oauthBtn}`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      {/* Server error */}
      {serverError && (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className="form-group">
          <label htmlFor="signup-username" className="form-label">
            Username
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="username"
            value={fields.username}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${errors.username ? styles.inputError : ''}`}
            aria-describedby={errors.username ? 'username-error' : undefined}
            aria-invalid={!!errors.username}
            maxLength={20}
          />
          {errors.username && (
            <p id="username-error" className="form-error">
              {errors.username}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="signup-displayname" className="form-label">
            Display Name
          </label>
          <input
            id="signup-displayname"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="Name"
            value={fields.displayName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${errors.displayName ? styles.inputError : ''}`}
            aria-describedby={errors.displayName ? 'displayname-error' : undefined}
            aria-invalid={!!errors.displayName}
            maxLength={50}
          />
          {errors.displayName && (
            <p id="displayname-error" className="form-error">
              {errors.displayName}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="signup-email" className="form-label">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${errors.email ? styles.inputError : ''}`}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="email-error" className="form-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="signup-password" className="form-label">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${errors.password ? styles.inputError : ''}`}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p id="password-error" className="form-error">
              {errors.password}
            </p>
          )}
          
          {/* Live password checklist */}
          <div className={styles.passwordChecklist}>
            <div className={styles.checkItem}>
              {fields.password.length >= 8 ? <CheckCircle2 size={14} className={styles.checkIconSuccess} /> : <XCircle size={14} className={styles.checkIconError} />}
              <span className={fields.password.length >= 8 ? styles.checkTextSuccess : styles.checkTextError}>8+ characters</span>
            </div>
            <div className={styles.checkItem}>
              {/[A-Z]/.test(fields.password) ? <CheckCircle2 size={14} className={styles.checkIconSuccess} /> : <XCircle size={14} className={styles.checkIconError} />}
              <span className={/[A-Z]/.test(fields.password) ? styles.checkTextSuccess : styles.checkTextError}>One uppercase letter</span>
            </div>
            <div className={styles.checkItem}>
              {/[0-9]/.test(fields.password) ? <CheckCircle2 size={14} className={styles.checkIconSuccess} /> : <XCircle size={14} className={styles.checkIconError} />}
              <span className={/[0-9]/.test(fields.password) ? styles.checkTextSuccess : styles.checkTextError}>One number</span>
            </div>
            <div className={styles.checkItem}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(fields.password) ? <CheckCircle2 size={14} className={styles.checkIconSuccess} /> : <XCircle size={14} className={styles.checkIconError} />}
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(fields.password) ? styles.checkTextSuccess : styles.checkTextError}>One special character</span>
            </div>
          </div>
        </div>

        <div className={`form-group ${styles.termsGroup}`}>
          <label className={styles.termsLabel}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              className={styles.termsCheckbox}
            />
            <span>
              I agree to the <Link href="/terms" className={styles.switchLink} target="_blank">Terms and Conditions</Link>
            </span>
          </label>
          {errors.terms && <p className="form-error">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className={styles.switchAuth}>
        Already have an account?{' '}
        <Link href="/login" className={styles.switchLink}>
          Log in
        </Link>
      </p>
    </div>
  );
}
