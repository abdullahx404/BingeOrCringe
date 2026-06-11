import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GlobalNav from '@/components/nav/GlobalNav';
import Link from 'next/link';
import { User } from 'lucide-react';
import styles from './page.module.css';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Delete notifications older than 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .lt('created_at', yesterday);

  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      id, type, is_read, created_at,
      actor:profiles!actor_id(id, display_name, username, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Mark all as read when visiting this page
  if (notifications && notifications.some(n => !n.is_read)) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  }

  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Notifications</h1>
          
          <div className={styles.list}>
            {!notifications || notifications.length === 0 ? (
              <p className={styles.empty}>No notifications yet.</p>
            ) : (
              notifications.map((n: any) => (
                <Link key={n.id} href={`/u/${n.actor.username}`} className={styles.notificationCard}>
                  <div className={styles.avatarWrap}>
                    {n.actor.avatar_url ? (
                      <img src={n.actor.avatar_url} alt={n.actor.username} className={styles.avatar} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className={styles.text}>
                      <strong>{n.actor.display_name}</strong> started following you
                    </div>
                    <div className={styles.time}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
