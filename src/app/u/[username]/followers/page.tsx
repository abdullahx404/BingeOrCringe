import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GlobalNav from '@/components/nav/GlobalNav';
import Link from 'next/link';
import { User, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default async function FollowersPage({ params }: { params: { username: string } }) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // Ensure only the owner can view their followers
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== profile.id) {
    notFound(); // or redirect to their profile
  }

  // Get followers (people following this profile)
  const { data: follows } = await supabase
    .from('follows')
    .select('follower:profiles!follower_id(id, display_name, username, avatar_url)')
    .eq('following_id', profile.id);

  const followers = follows?.map(f => f.follower).filter(Boolean) || [];

  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Link href={`/u/${profile.username}`} className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Profile
            </Link>
          </div>
          
          <h1 className={styles.title}>{profile.display_name}&apos;s Followers</h1>
          
          <div className={styles.list}>
            {followers.length === 0 ? (
              <p className={styles.empty}>No followers yet.</p>
            ) : (
              followers.map((p: any) => (
                <Link key={p.id} href={`/u/${p.username}`} className={styles.userCard}>
                  <div className={styles.avatarWrap}>
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.username} className={styles.avatar} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className={styles.displayName}>{p.display_name}</div>
                    <div className={styles.username}>@{p.username}</div>
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
