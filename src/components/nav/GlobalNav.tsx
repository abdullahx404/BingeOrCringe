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
  let unreadMessages = 0;
  let unreadNotifications = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single();
    displayName = profile?.display_name ?? null;
    username = profile?.username ?? null;

    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    unreadMessages = msgCount ?? 0;

    const { count: notifCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    unreadNotifications = notifCount ?? 0;
  }

  return (
    <nav className={styles.nav}>
      {/* ── Main row ── */}
      <div className={styles.navInner}>
        <Link href={user ? '/search' : '/'} className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
          <img src="/logo-text.png" alt="BingeOrCringe" style={{ height: '24px', width: 'auto', marginTop: '3px' }} />
        </Link>

        {/* Desktop search — hidden on mobile via CSS, shown below */}
        <div className={styles.search}>
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        {/* Right group: Browse + List + username + Logout */}
        <div className={styles.rightGroup}>
          <NavLinks 
            isLoggedIn={!!user} 
            userId={user?.id}
            displayName={displayName} 
            username={username} 
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
          />
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
