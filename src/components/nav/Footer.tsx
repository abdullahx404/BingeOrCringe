import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
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
          <div className={styles.tmdbAttr}>
            {/* TMDB attribution requires logo or specific text */}
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
              alt="TMDB Logo" 
              className={styles.tmdbLogo}
            />
            <p>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
