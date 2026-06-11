import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import styles from './TopRankers.module.css';

interface TopRanker {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_rankings: number;
}

export default async function TopRankers() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_top_rankers');
  const rankers = (data as TopRanker[]) || [];

  if (rankers.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Crown size={20} className={styles.icon} />
        Top Rankers
      </h3>
      <div className={styles.list}>
        {rankers.map((ranker, idx) => (
          <Link key={ranker.id} href={`/u/${ranker.username}`} className={styles.rankerCard}>
            <div className={styles.rank}>{idx + 1}</div>
            <div className={styles.avatarWrap}>
              {ranker.avatar_url ? (
                <img src={ranker.avatar_url} alt={ranker.username} className={styles.avatar} />
              ) : (
                ranker.username[0].toUpperCase()
              )}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>@{ranker.username}</div>
              <div className={styles.stats}>{ranker.total_rankings} rankings</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
