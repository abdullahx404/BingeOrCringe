'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { logOut } from '@/lib/auth/actions';
import NProgress from 'nprogress';
import styles from './NavLinks.module.css';

interface Props {
  userId?: string;
  displayName?: string | null;
  username?: string | null;
  isLoggedIn?: boolean;
  unreadMessages?: number;
  unreadNotifications?: number;
}

export default function NavLinks({ userId, displayName, username, isLoggedIn, unreadMessages = 0, unreadNotifications = 0 }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onBrowse = pathname === '/search' || pathname.startsWith('/search?');
  const onList   = pathname === '/dashboard' || pathname.startsWith('/dashboard');

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [liveMsgCount, setLiveMsgCount] = useState(unreadMessages);
  const [liveNotifCount, setLiveNotifCount] = useState(unreadNotifications);

  // Sync initial props
  useEffect(() => { setLiveMsgCount(unreadMessages); }, [unreadMessages]);
  useEffect(() => { setLiveNotifCount(unreadNotifications); }, [unreadNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const { createClient } = require('@/lib/supabase/client');
    const supabase = createClient();

    const channel = supabase.channel('nav-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT' && !payload.new.is_read) {
          setLiveMsgCount(p => p + 1);
        } else if (payload.eventType === 'UPDATE' && payload.new.is_read && !payload.old.is_read) {
          setLiveMsgCount(p => Math.max(0, p - 1));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT' && !payload.new.is_read) {
          setLiveNotifCount(p => p + 1);
        } else if (payload.eventType === 'UPDATE' && payload.new.is_read && !payload.old.is_read) {
          setLiveNotifCount(p => Math.max(0, p - 1));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const hasAnyUnread = liveMsgCount > 0 || liveNotifCount > 0;

  // ── Desktop nav ──────────────────────────────────────────
  const desktopNav = isLoggedIn ? (
    <div className={styles.desktopLinks}>
      <Link href="/search"    className={`${styles.navLink} ${onBrowse ? styles.active : ''}`}>Browse</Link>
      <Link href="/dashboard" className={`${styles.navLink} ${onList   ? styles.active : ''}`}>My Lists</Link>
      
      {username && (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <button 
            className={styles.dropdownToggle} 
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className={styles.itemWithBadge}>
              {displayName || username}
              {hasAnyUnread && <span className={styles.dropdownRedDot} />}
            </span>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link href={`/u/${username}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                Profile
              </Link>
              <Link href="/messages" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span className={styles.itemWithBadge}>
                  Messages
                  {liveMsgCount > 0 && <span className={styles.redDot} />}
                </span>
              </Link>
              <Link href="/notifications" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                <span className={styles.itemWithBadge}>
                  Notifications
                  {liveNotifCount > 0 && <span className={styles.redDot} />}
                </span>
              </Link>
              <div className={styles.dropdownDivider} />
              <form action={logOut} className={styles.logoutForm} onSubmit={() => NProgress.start()}>
                <button type="submit" className={`${styles.dropdownItem} ${styles.dropdownLogout}`}>
                  Log out
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className={styles.authLinks}>
      <Link href="/login"  className="btn btn-ghost btn-sm">Log In</Link>
      <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
    </div>
  );

  // ── Mobile hamburger ─────────────────────────────────────
  const mobileNav = isLoggedIn ? (
    <div className={styles.hamburgerWrapper} ref={menuRef}>
      <button
        className={`${styles.hamburgerBtn} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <div className={styles.hamburgerBar} />
        <div className={styles.hamburgerBar} />
        <div className={styles.hamburgerBar} />
      </button>

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
            <>
              <Link
                href="/dashboard"
                className={`${styles.dropItem} ${onList ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                My Lists
              </Link>
              <Link
                href="/messages"
                className={`${styles.dropItem} ${pathname.startsWith('/messages') ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.itemWithBadge}>
                  Messages
                  {liveMsgCount > 0 && <span className={styles.redDot} />}
                </span>
              </Link>
              <Link
                href="/notifications"
                className={`${styles.dropItem} ${pathname === '/notifications' ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.itemWithBadge}>
                  Notifications
                  {liveNotifCount > 0 && <span className={styles.redDot} />}
                </span>
              </Link>
            </>
          )}
          {isLoggedIn && username && (
            <Link 
              href={`/u/${username}`} 
              className={`${styles.dropItem} ${pathname === `/u/${username}` ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          )}
          {isLoggedIn ? (
            <form action={logOut} className={styles.dropLogout} onSubmit={() => NProgress.start()}>
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
  ) : null;

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
