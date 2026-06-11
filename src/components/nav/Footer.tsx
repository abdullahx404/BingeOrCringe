'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup' || pathname === '/settings') {
    return null;
  }
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerInner}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Clapperboard size={20} className={styles.logoIcon} />
              <span className={styles.logoText}>BingeOrCringe</span>
            </Link>
            <p className={styles.tagline}>
              Rank your obsessions. Organize your watchlist. 
              Share your hot takes with the world.
            </p>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.linksTitle}>Navigation</h4>
            <ul className={styles.linksList}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/login">Log In</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} BingeOrCringe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
