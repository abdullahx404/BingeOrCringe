import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GlobalNav from '@/components/nav/GlobalNav';
import Link from 'next/link';
import { User, ArrowLeft } from 'lucide-react';
import styles from '../followers/page.module.css';

export default async function FollowingPage({ params }: { params: { username: string } }) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // Get following (people this profile is following)
  const { data: follows } = await supabase
    .from('follows')
    .select('following:profiles!following_id(id, display_name, username, avatar_url)')
    .eq('follower_id', profile.id);

  const following = follows?.map(f => f.following) || [];

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
          
          <h1 className={styles.title}>{profile.display_name} is Following</h1>
          
          <div className={styles.list}>
            {following.length === 0 ? (
              <p className={styles.empty}>Not following anyone yet.</p>
            ) : (
              following.map((p: any) => (
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
