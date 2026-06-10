import { Suspense } from 'react';
import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import SearchInput from '@/components/search/SearchInput';
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
        {/* Logo → always goes to Browse/Search */}
        <Link href="/search" className={styles.logo}>
          <Clapperboard size={20} className={styles.logoIcon} />
          <span className={styles.logoText}>BingeOrCringe</span>
        </Link>

        {/* Global search bar */}
        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Right-side actions */}
        <div className={styles.right}>
          {user ? (
            <>
              <Link href="/search" className="btn btn-ghost btn-sm">Browse</Link>
              <Link href="/dashboard" className={styles.username}>
                {displayName ?? user.email}
              </Link>
              <form action={logOut}>
                <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
