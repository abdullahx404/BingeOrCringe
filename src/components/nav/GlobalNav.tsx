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
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    displayName = profile?.display_name ?? null;
  }

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.navInner}`}>
        {/* Logo → always goes to /search */}
        <Link href="/search" className={styles.logo}>
          <Clapperboard size={20} className={styles.logoIcon} />
          <span className={styles.logoText}>BingeOrCringe</span>
        </Link>

        {/* Center search bar */}
        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Right — pathname-aware Browse + List + username */}
        <NavLinks
          isLoggedIn={!!user}
          displayName={displayName}
        />

        {/* Logout outside NavLinks so it can stay a server form */}
        {user && (
          <form action={logOut} className={styles.logoutForm}>
            <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
          </form>
        )}
      </div>
    </nav>
  );
}
