import { redirect } from 'next/navigation';
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

  // Middleware already handles redirect, this is a safety net
  if (!user) redirect('/login');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, is_public')
    .eq('id', user.id)
    .single();

  // Fetch ranking count
  const { count: rankingCount } = await supabase
    .from('rankings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className={styles.page}>
      {/* Header bar */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <div className={styles.logo}>
            <span>🎬</span>
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

      {/* Main content */}
      <main className={styles.main}>
        <div className="container">
          {/* Welcome section */}
          <div className={styles.welcome}>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>
                Hey, {profile?.display_name ?? 'there'} 👋
              </h1>
              <p className={styles.welcomeSub}>
                {rankingCount === 0
                  ? "You haven't ranked anything yet. Go find something to rate!"
                  : `You've ranked ${rankingCount} title${rankingCount !== 1 ? 's' : ''} so far. Keep going!`}
              </p>
            </div>

            <div className={styles.welcomeStats}>
              <div className={styles.statChip}>
                <span className={styles.statValue}>{rankingCount ?? 0}</span>
                <span className={styles.statLabel}>Rankings</span>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statValue}>
                  {profile?.is_public ? '🌐' : '🔒'}
                </span>
                <span className={styles.statLabel}>
                  {profile?.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          {/* Empty state — Phase 4 will fill this with actual rankings */}
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎬</div>
            <h2 className={styles.emptyTitle}>Your collection is empty</h2>
            <p className={styles.emptyDesc}>
              Search for a movie or show and give it a tier — Goated, Binge, Mid, Cringe, or Trash.
            </p>
            <a href="/search" className="btn btn-primary">
              Search Movies
            </a>
          </div>

          {/* Coming in future phases notice */}
          <div className={styles.phaseNotice}>
            <p>🚧 Full collection view, tier filters, and quick-edit coming in Phase 5.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
