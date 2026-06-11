'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { logOut } from '@/lib/auth/actions';
import styles from './NavLinks.module.css';

interface Props {
  displayName?: string | null;
  isLoggedIn?: boolean;
}

export default function NavLinks({ displayName, isLoggedIn }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const onBrowse = pathname === '/search' || pathname.startsWith('/search?');
  const onList   = pathname === '/dashboard' || pathname.startsWith('/dashboard');

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // ── Desktop nav ──────────────────────────────────────────
  const desktopNav = isLoggedIn ? (
    <div className={styles.desktopLinks}>
      <Link href="/search"    className={`${styles.navLink} ${onBrowse ? styles.active : ''}`}>Browse</Link>
      <Link href="/dashboard" className={`${styles.navLink} ${onList   ? styles.active : ''}`}>List</Link>
      {displayName && (
        <Link href="/dashboard" className={styles.username}>{displayName}</Link>
      )}
    </div>
  ) : (
    <div className={styles.desktopLinks}>
      <Link href="/login"  className="btn btn-ghost btn-sm">Log In</Link>
      <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
    </div>
  );

  // ── Mobile hamburger ─────────────────────────────────────
  const mobileNav = (
    <div className={styles.hamburgerWrapper} ref={menuRef}>
      {/* Animated Hamburger Button */}
      <button
        className={`${styles.hamburgerBtn} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <div className={styles.hamburgerBar} />
        <div className={styles.hamburgerBar} />
        <div className={styles.hamburgerBar} />
      </button>

      {/* Full Screen Glass Overlay */}
      <div className={`${styles.menuOverlay} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.menuNav}>
          <Link
            href="/search"
            className={`${styles.dropItem} ${onBrowse ? styles.active : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Browse
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={`${styles.dropItem} ${onList ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              List
            </Link>
          )}
          {isLoggedIn && displayName && (
            <span className={styles.dropUser}>{displayName}</span>
          )}
          {isLoggedIn ? (
            <form action={logOut} className={styles.dropLogout}>
              <button type="submit" className={styles.logoutBtn} onClick={() => setMenuOpen(false)}>
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login"  className={styles.dropItem} onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link href="/signup" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
