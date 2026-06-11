'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './error.module.css';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <AlertTriangle size={56} className={styles.icon} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Something went wrong!</h1>
        <p className={styles.description}>
          We encountered an unexpected error. Don&apos;t worry, it&apos;s likely a temporary glitch.
        </p>
        <div className={styles.actions}>
          <button onClick={() => reset()} className="btn btn-primary">
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
