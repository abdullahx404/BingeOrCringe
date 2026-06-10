'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavLinks.module.css';

interface Props {
  displayName?: string | null;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function NavLinks({ displayName, isLoggedIn }: Props) {
  const pathname = usePathname();

  const onBrowse = pathname === '/search' || pathname.startsWith('/search?');
  const onList   = pathname === '/dashboard' || pathname.startsWith('/dashboard');

  if (!isLoggedIn) {
    return (
      <div className={styles.right}>
        <Link href="/login"  className="btn btn-ghost btn-sm">Log In</Link>
        <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
      </div>
    );
  }

  return (
    <div className={styles.right}>
      <Link
        href="/search"
        className={`${styles.navLink} ${onBrowse ? styles.active : ''}`}
      >
        Browse
      </Link>
      <Link
        href="/dashboard"
        className={`${styles.navLink} ${onList ? styles.active : ''}`}
      >
        List
      </Link>
      <Link href="/dashboard" className={styles.username}>
        {displayName}
      </Link>
    </div>
  );
}
