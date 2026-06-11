import Link from 'next/link';
import { Search, Home, Clapperboard } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Clapperboard size={64} className={styles.icon} strokeWidth={1} />
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Scene Not Found</h2>
        <p className={styles.description}>
          Looks like you&apos;ve wandered off the script. We can&apos;t find the page you&apos;re looking for.
        </p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-secondary">
            <Home size={18} />
            Go Home
          </Link>
          <Link href="/search" className="btn btn-primary">
            <Search size={18} />
            Search Titles
          </Link>
        </div>
      </div>
    </div>
  );
}
