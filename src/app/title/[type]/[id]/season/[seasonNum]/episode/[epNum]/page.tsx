import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { User, Star, Crown } from 'lucide-react';
import { getEpisode, tmdbImage } from '@/lib/tmdb/client';
import styles from './page.module.css';

interface Props {
  params: { id: string; seasonNum: string; epNum: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const ep = await getEpisode(
      parseInt(params.id),
      parseInt(params.seasonNum),
      parseInt(params.epNum)
    );
    return { title: ep.name };
  } catch {}
  return { title: 'Episode' };
}

export default async function EpisodePage({ params }: Props) {
  const tvId = parseInt(params.id);
  const seasonNum = parseInt(params.seasonNum);
  const epNum = parseInt(params.epNum);
  if (isNaN(tvId) || isNaN(seasonNum) || isNaN(epNum)) notFound();

  try {
    const ep = await getEpisode(tvId, seasonNum, epNum);
    const still = tmdbImage(ep.still_path, 'w780');

    return (
      <div className={styles.page}>
        <div className={styles.backNav}>
          <div className="container">
            <Link
              href={`/title/tv/${tvId}/season/${seasonNum}`}
              className={styles.backLink}
            >
              ← Back to Season {seasonNum}
            </Link>
          </div>
        </div>

        <div className={styles.hero}>
          <div className="container">
            {/* Still image */}
            {still && (
              <div className={styles.stillWrap}>
                <Image
                  src={still}
                  alt={ep.name}
                  fill
                  className={styles.stillImg}
                  priority
                />
              </div>
            )}

            {/* Meta */}
            <div className={styles.meta}>
              <div className={styles.breadcrumb}>
                <span>Season {ep.season_number}</span>
                <span className={styles.dot}>›</span>
                <span>Episode {ep.episode_number}</span>
              </div>

              <h1 className={styles.title}>{ep.name}</h1>

              <div className={styles.facts}>
                {ep.air_date && <span>{ep.air_date}</span>}
                {ep.runtime && (
                  <>
                    <span className={styles.dot}>·</span>
                    <span>{ep.runtime}m</span>
                  </>
                )}
                {ep.vote_average > 0 && (
                  <>
                    <span className={styles.dot}>·</span>
                    <span className={styles.ratingInline}>
                      <Star size={12} fill="currentColor" />
                      {ep.vote_average.toFixed(1)}
                    </span>
                    <span className={styles.voteCount}>({ep.vote_count.toLocaleString()})</span>
                  </>
                )}
              </div>

              {ep.overview && <p className={styles.overview}>{ep.overview}</p>}

              {/* Rank CTA */}
              <div className={styles.rankCta}>
                <Link href="/login" className="btn btn-primary">
                  <Crown size={16} />
                  Rank This Episode
                </Link>
                <p className={styles.rankHint}>Log in to add to your collection</p>
              </div>
            </div>

            {/* Guest Stars */}
            {ep.guest_stars && ep.guest_stars.length > 0 && (
              <div className={styles.castSection}>
                <h2 className={styles.castTitle}>Guest Stars</h2>
                <div className={styles.castGrid}>
                  {ep.guest_stars.slice(0, 8).map((person) => {
                    const photo = tmdbImage(person.profile_path, 'w185');
                    return (
                      <div key={person.id} className={styles.castCard}>
                        <div className={styles.castPhoto}>
                          {photo ? (
                            <Image src={photo} alt={person.name} fill className={styles.castImg} />
                          ) : (
                            <div className={styles.castPlaceholder}>
                              <User size={28} strokeWidth={1.2} />
                            </div>
                          )}
                        </div>
                        <p className={styles.castName}>{person.name}</p>
                        <p className={styles.castChar}>{person.character}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
