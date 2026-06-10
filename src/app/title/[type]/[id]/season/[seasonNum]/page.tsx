import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Tv, Star, Crown, ArrowLeft } from 'lucide-react';
import { getSeason, tmdbImage } from '@/lib/tmdb/client';
import { createClient } from '@/lib/supabase/server';
import RankButton from '@/components/rankings/RankButton';
import styles from './page.module.css';

interface Props {
  params: { type: string; id: string; seasonNum: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const season = await getSeason(parseInt(params.id), parseInt(params.seasonNum));
    return { title: season.name };
  } catch {}
  return { title: 'Season' };
}

export default async function SeasonPage({ params }: Props) {
  const tvId = parseInt(params.id);
  const seasonNum = parseInt(params.seasonNum);
  if (isNaN(tvId) || isNaN(seasonNum)) notFound();

  let season: Awaited<ReturnType<typeof getSeason>>;
  try {
    season = await getSeason(tvId, seasonNum);
  } catch (err) {
    // Log error for debugging but show a friendly error page
    console.error('[SeasonPage] getSeason failed:', err);
    notFound();
  }

  const poster = tmdbImage(season!.poster_path, 'w342');

  // Auth — check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check existing season ranking
  let existingRanking = null;
  if (user) {
    const { data } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', user.id)
      .eq('tmdb_id', tvId)
      .eq('media_type', 'season')
      .eq('season_number', seasonNum)
      .is('episode_number', null)
      .single();
    existingRanking = data;
  }

  return (
    <div className={styles.page}>
      {/* Back nav */}
      <div className={styles.backNav}>
        <div className="container">
          <Link href={`/title/tv/${tvId}`} className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Show
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          {poster && (
            <div className={styles.posterWrap}>
              <Image src={poster} alt={season!.name} fill className={styles.posterImg} />
            </div>
          )}
          <div className={styles.meta}>
            <span className={styles.typePill}>Season {seasonNum}</span>
            <h1 className={styles.title}>{season!.name}</h1>
            <div className={styles.facts}>
              {season!.air_date && <span>{season!.air_date.slice(0, 4)}</span>}
              <span className={styles.dot}>·</span>
              <span>{season!.episodes.length} Episodes</span>
              {season!.vote_average > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.ratingInline}>
                    <Star size={12} fill="currentColor" />
                    {season!.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>
            {season!.overview && <p className={styles.overview}>{season!.overview}</p>}

            {/* Rank this season */}
            <div className={styles.rankCta}>
              {user ? (
                <RankButton
                  media={{
                    tmdb_id: tvId,
                    media_type: 'season',
                    season_number: seasonNum,
                    title: season!.name,
                    poster_path: season!.poster_path,
                    year: season!.air_date ? season!.air_date.slice(0, 4) : null,
                  }}
                  existing={existingRanking}
                />
              ) : (
                <Link href="/login" className="btn btn-primary">
                  <Crown size={16} />
                  Rank This Season
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes list */}
      <div className={styles.episodesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Episodes</h2>
          <div className={styles.episodesList}>
            {season!.episodes.map((ep) => {
              const still = tmdbImage(ep.still_path, 'w300');
              return (
                /* Episode card — navigates to episode detail on click */
                <Link
                  key={ep.id}
                  href={`/title/tv/${tvId}/season/${seasonNum}/episode/${ep.episode_number}`}
                  className={styles.episodeCard}
                >
                  {/* Still image */}
                  <div className={styles.still}>
                    {still ? (
                      <Image src={still} alt={ep.name} fill className={styles.stillImg} />
                    ) : (
                      <div className={styles.stillPlaceholder}>
                        <Tv size={24} strokeWidth={1} />
                      </div>
                    )}
                    {ep.runtime && (
                      <span className={styles.runtime}>{ep.runtime}m</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.epInfo}>
                    <div className={styles.epHeader}>
                      <span className={styles.epNum}>E{ep.episode_number}</span>
                      <span className={styles.epTitle}>{ep.name}</span>
                      {ep.vote_average > 0 && (
                        <span className={styles.epRating}>
                          <Star size={10} fill="currentColor" />
                          {ep.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {ep.air_date && (
                      <p className={styles.epDate}>{ep.air_date}</p>
                    )}
                    {ep.overview && (
                      <p className={styles.epOverview}>{ep.overview}</p>
                    )}
                  </div>

                  {/* Rank indicator — visual only, no nested link */}
                  <div className={styles.epRankHint} aria-hidden="true">
                    <Crown size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
