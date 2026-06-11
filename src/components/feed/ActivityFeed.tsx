import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Crown, Play, Minus, ThumbsDown, Trash2 } from 'lucide-react';
import { tmdbImage } from '@/lib/tmdb/client';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityFeed.module.css';

const TIER_ICONS: Record<string, React.ReactNode> = {
  goated: <Crown size={14} />,
  binge: <Play size={14} />,
  mid: <Minus size={14} />,
  cringe: <ThumbsDown size={14} />,
  trash: <Trash2 size={14} />
};

export default async function ActivityFeed({ userId }: { userId: string }) {
  const supabase = await createClient();

  // 1. Get who this user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = follows?.map(f => f.following_id) || [];

  if (followingIds.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Your Feed is Empty</h2>
        <p>Follow other users to see their rankings here!</p>
        <Link href="/search?type=users" className="btn btn-primary">Find Users</Link>
      </div>
    );
  }

  // 2. Fetch their recent rankings
  const { data: rankings } = await supabase
    .from('rankings')
    .select('*, profiles(username, display_name, avatar_url)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!rankings || rankings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Recent Activity</h2>
        <p>The people you follow haven't ranked anything yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <h2 className={styles.feedTitle}>Activity Feed</h2>
      <div className={styles.feedList}>
        {rankings.map(ranking => {
          const profile = ranking.profiles as any;
          const timeAgo = formatDistanceToNow(new Date(ranking.created_at), { addSuffix: true });
          const posterUrl = tmdbImage(ranking.poster_path, 'w185');

          return (
            <div key={ranking.id} className={styles.feedCard}>
              <div className={styles.cardHeader}>
                <Link href={`/u/${profile.username}`} className={styles.userLink}>
                  <div className={styles.avatarWrap}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className={styles.avatar} />
                    ) : (
                      profile.username[0].toUpperCase()
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.displayName}>{profile.display_name}</span>
                    <span className={styles.username}>@{profile.username}</span>
                  </div>
                </Link>
                <div className={styles.time}>{timeAgo}</div>
              </div>

              <div className={styles.cardBody}>
                {posterUrl ? (
                  <Link href={`/title/${ranking.media_type}/${ranking.tmdb_id}`}>
                    <img src={posterUrl} alt={ranking.title} className={styles.poster} />
                  </Link>
                ) : (
                  <div className={styles.posterPlaceholder} />
                )}
                
                <div className={styles.rankingInfo}>
                  <span className={styles.actionText}>ranked</span>
                  <Link href={`/title/${ranking.media_type}/${ranking.tmdb_id}`} className={styles.movieTitle}>
                    {ranking.title} {ranking.year ? `(${ranking.year})` : ''}
                  </Link>
                  <span className={styles.actionText}>as</span>
                  <div className={`${styles.tierBadge} ${styles[ranking.tier]}`}>
                    {TIER_ICONS[ranking.tier]}
                    <span style={{textTransform: 'capitalize'}}>{ranking.tier}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
