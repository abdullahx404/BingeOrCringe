import { redirect } from 'next/navigation';
import { Film, Globe, Lock, Info, Clapperboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logOut } from '@/lib/auth/actions';
import styles from './page.module.css';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, is_public')
    .eq('id', user.id)
    .single();

  const { count: rankingCount } = await supabase
    .from('rankings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.userBadge}>
              {profile?.display_name ?? user.email}
            </span>
            <form action={logOut}>
              <button type="submit" className="btn btn-ghost btn-sm">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className="container">
          {/* Welcome */}
          <div className={styles.welcome}>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>
                Hey, {profile?.display_name ?? 'there'}
              </h1>
              <p className={styles.welcomeSub}>
                {rankingCount === 0
                  ? "Nothing ranked yet. Go search something and drop it in a tier."
                  : `${rankingCount} title${rankingCount !== 1 ? 's' : ''} ranked. Keep going.`}
              </p>
            </div>

            <div className={styles.welcomeStats}>
              <div className={styles.statChip}>
                <span className={styles.statValue}>{rankingCount ?? 0}</span>
                <span className={styles.statLabel}>Rankings</span>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statValue}>
                  {profile?.is_public
                    ? <Globe size={20} />
                    : <Lock size={20} />}
                </span>
                <span className={styles.statLabel}>
                  {profile?.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Film size={48} strokeWidth={1.2} />
            </div>
            <h2 className={styles.emptyTitle}>Your collection is empty</h2>
            <p className={styles.emptyDesc}>
              Search for a movie or show and rank it — Goated, Binge, Mid, Cringe, or Trash.
            </p>
            <a href="/search" className="btn btn-primary">
              Search Titles
            </a>
          </div>

          {/* Phase notice */}
          <div className={styles.phaseNotice}>
            <Info size={14} />
            <p>Full collection view, tier filters, and quick-edit coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
