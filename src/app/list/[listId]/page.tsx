import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Ranking, CustomList } from '@/types';
import CollectionGrid from '@/components/dashboard/CollectionGrid';
import GlobalNav from '@/components/nav/GlobalNav';
import ShareProfileButton from '@/components/profile/ShareProfileButton';
import { Film, Lock } from 'lucide-react';
import styles from './page.module.css';

interface Props {
  params: { listId: string };
}

export default async function ListPage({ params }: Props) {
  const supabase = await createClient();

  const { data: listRaw, error: listErr } = await supabase
    .from('lists')
    .select('*, profiles(username, display_name)')
    .eq('id', params.listId)
    .single();

  if (listErr || !listRaw) {
    notFound();
  }

  const list = listRaw as CustomList & { profiles: { username: string; display_name: string } };

  // Check auth for private lists
  const { data: { user } } = await supabase.auth.getUser();
  if (!list.is_public && user?.id !== list.user_id) {
    return (
      <div className={styles.page}>
        <GlobalNav />
        <div className={styles.emptyState}>
          <Lock size={48} className={styles.emptyIcon} />
          <h1 className={styles.title}>Private List</h1>
          <p className={styles.subtitle}>This list is private or you do not have access.</p>
        </div>
      </div>
    );
  }

  // Fetch list items
  const { data: listItems } = await supabase
    .from('list_items')
    .select('ranking_id')
    .eq('list_id', list.id);

  const rankingIds = listItems?.map(item => item.ranking_id) || [];

  let rankings: Ranking[] = [];
  if (rankingIds.length > 0) {
    const { data: rankingData } = await supabase
      .from('rankings')
      .select('*')
      .in('id', rankingIds);
    rankings = rankingData || [];
  }

  const movies = rankings.filter(r => r.media_type === 'movie');
  const tvRelated = rankings.filter(r => ['tv', 'season', 'episode'].includes(r.media_type));

  // Build TV groups manually for display
  const tvGroupMap = new Map();
  for (const r of tvRelated) {
    if (!tvGroupMap.has(r.tmdb_id)) {
      tvGroupMap.set(r.tmdb_id, {
        tmdbId: r.tmdb_id,
        showTitle: r.title, // Approximation for lists
        showPoster: r.poster_path,
        showYear: r.year,
        showRanking: null,
        seasons: [],
        episodes: [],
      });
    }
    const g = tvGroupMap.get(r.tmdb_id)!;
    if (r.media_type === 'tv') g.showRanking = r;
    else if (r.media_type === 'season') g.seasons.push(r);
    else g.episodes.push(r);
  }

  const tvGroups = Array.from(tvGroupMap.values());
  const hasContent = movies.length > 0 || tvGroups.length > 0;

  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{list.name}</h1>
              <p className={styles.subtitle}>
                Created by {list.profiles.display_name} (@{list.profiles.username})
              </p>
            </div>
            {list.is_public && (
              <ShareProfileButton username={`list/${list.id}`} />
            )}
          </div>

          {!hasContent ? (
            <div className={styles.emptyState}>
              <Film size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>Empty List</h2>
              <p className={styles.subtitle}>There are no titles in this list yet.</p>
            </div>
          ) : (
            <CollectionGrid movies={movies} tvGroups={tvGroups} />
          )}
        </div>
      </main>
    </div>
  );
}
