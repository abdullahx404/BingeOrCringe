import { Suspense } from 'react';
import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import SearchInput from '@/components/search/SearchInput';
import NavLinks from './NavLinks';
import styles from './GlobalNav.module.css';

export default async function GlobalNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single();
    displayName = profile?.display_name ?? null;
    username = profile?.username ?? null;
  }

  return (
    <nav className={styles.nav}>
      {/* ── Main row ── */}
      <div className={styles.navInner}>
        <Link href={user ? '/search' : '/'} className={styles.logo}>
          <Clapperboard size={20} className={styles.logoIcon} />
          <span className={styles.logoText}>BingeOrCringe</span>
        </Link>

        {/* Desktop search — hidden on mobile via CSS, shown below */}
        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Right group: Browse + List + username + Logout */}
        <div className={styles.rightGroup}>
          <NavLinks isLoggedIn={!!user} displayName={displayName} username={username} />
        </div>
      </div>

      {/* ── Mobile search row — only visible on small screens ── */}
      <div className={styles.mobileSearch}>
        <Suspense fallback={null}>
          <SearchInput />
        </Suspense>
      </div>
    </nav>
  );
}
