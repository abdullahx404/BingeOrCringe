import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { User, Star, Crown } from 'lucide-react';
import { getEpisode, tmdbImage } from '@/lib/tmdb/client';
import { createClient } from '@/lib/supabase/server';
import RankButton from '@/components/rankings/RankButton';
import GlobalNav from '@/components/nav/GlobalNav';
import styles from './page.module.css';

interface Props {
  params: { type: string; id: string; seasonNum: string; epNum: string };
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

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Existing episode ranking (if logged in)
  let existingRanking = null;
  if (user) {
    const { data } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', user.id)
      .eq('tmdb_id', tvId)
      .eq('media_type', 'episode')
      .eq('season_number', seasonNum)
      .eq('episode_number', epNum)
      .single();
    existingRanking = data;
  }

  try {
    const ep = await getEpisode(tvId, seasonNum, epNum);
    const still = tmdbImage(ep.still_path, 'w780');

    return (
      <div className={styles.page}>
        <GlobalNav />

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

              {/* Rank CTA — auth-aware */}
              <div className={styles.rankCta}>
                {user ? (
                  <RankButton
                    media={{
                      tmdb_id: tvId,
                      media_type: 'episode',
                      season_number: seasonNum,
                      episode_number: epNum,
                      title: ep.name,
                      poster_path: ep.still_path,
                      year: ep.air_date ? ep.air_date.slice(0, 4) : null,
                    }}
                    existing={existingRanking}
                  />
                ) : (
                  <Link href={`/login?next=/title/tv/${tvId}/season/${seasonNum}/episode/${epNum}`} className="btn btn-primary">
                    <Crown size={16} />
                    Log in to Rank
                  </Link>
                )}
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
