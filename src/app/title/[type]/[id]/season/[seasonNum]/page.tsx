import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeason, tmdbImage } from '@/lib/tmdb/client';
import styles from './page.module.css';

interface Props {
  params: { id: string; seasonNum: string };
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

  try {
    const season = await getSeason(tvId, seasonNum);
    const poster = tmdbImage(season.poster_path, 'w342');

    return (
      <div className={styles.page}>
        <div className={styles.backNav}>
          <div className="container">
            <Link href={`/title/tv/${tvId}`} className={styles.backLink}>
              ← Back to Show
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={`container ${styles.headerInner}`}>
            {poster && (
              <div className={styles.posterWrap}>
                <Image src={poster} alt={season.name} fill className={styles.posterImg} />
              </div>
            )}
            <div className={styles.meta}>
              <h1 className={styles.title}>{season.name}</h1>
              <div className={styles.facts}>
                {season.air_date && <span>{season.air_date.slice(0, 4)}</span>}
                <span className={styles.dot}>·</span>
                <span>{season.episodes.length} Episodes</span>
                {season.vote_average > 0 && (
                  <>
                    <span className={styles.dot}>·</span>
                    <span>⭐ {season.vote_average.toFixed(1)}</span>
                  </>
                )}
              </div>
              {season.overview && <p className={styles.overview}>{season.overview}</p>}
            </div>
          </div>
        </div>

        {/* Episodes list */}
        <div className={styles.episodesSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Episodes</h2>
            <div className={styles.episodesList}>
              {season.episodes.map((ep) => {
                const still = tmdbImage(ep.still_path, 'w300');
                return (
                  <Link
                    key={ep.id}
                    href={`/title/tv/${tvId}/season/${seasonNum}/episode/${ep.episode_number}`}
                    className={styles.episodeCard}
                  >
                    {/* Still */}
                    <div className={styles.still}>
                      {still ? (
                        <Image src={still} alt={ep.name} fill className={styles.stillImg} />
                      ) : (
                        <div className={styles.stillPlaceholder}>📺</div>
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
                          <span className={styles.epRating}>⭐ {ep.vote_average.toFixed(1)}</span>
                        )}
                      </div>
                      {ep.air_date && (
                        <p className={styles.epDate}>{ep.air_date}</p>
                      )}
                      {ep.overview && (
                        <p className={styles.epOverview}>{ep.overview}</p>
                      )}
                    </div>

                    <div className={styles.rankBtn}>
                      <Link
                        href="/login"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Rank
                      </Link>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
