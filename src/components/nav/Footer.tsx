'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup' || pathname === '/settings' || pathname.startsWith('/messages') || pathname === '/notifications' || pathname.startsWith('/u/')) {
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
              <li><Link href="/about">About</Link></li>
              <li><Link href="/how-to-use">How To Use</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.linksTitle}>Social</h4>
            <div className={styles.socialLinks}>
              <Link href="https://github.com/abdullahx404/BingeOrCringe" target="_blank" rel="noopener noreferrer" aria-label="Github"><FaGithub size={20} /></Link>
              <Link href="https://www.linkedin.com/in/abdullahzia-linked/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={20} /></Link>
              <Link href="https://www.instagram.com/abdullah.wtf/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={20} /></Link>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} BingeOrCringe. All rights reserved.
          </p>
          <div className={styles.tmdbAttr}>
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
              alt="TMDB Logo" 
              style={{ width: '120px', marginBottom: '8px' }} 
            />
            <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
