import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getMovie,
  getTvShow,
  tmdbImage,
} from '@/lib/tmdb/client';
import styles from './page.module.css';

interface Props {
  params: { type: string; id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt(params.id);
    if (params.type === 'movie') {
      const movie = await getMovie(id);
      return { title: movie.title, description: movie.overview };
    }
    if (params.type === 'tv') {
      const show = await getTvShow(id);
      return { title: show.name, description: show.overview };
    }
  } catch {}
  return { title: 'Title Not Found' };
}

export default async function TitlePage({ params }: Props) {
  const id = parseInt(params.id);
  if (isNaN(id) || !['movie', 'tv'].includes(params.type)) notFound();

  try {
    if (params.type === 'movie') {
      const movie = await getMovie(id);
      const poster = tmdbImage(movie.poster_path, 'w500');
      const backdrop = tmdbImage(movie.backdrop_path, 'w1280');
      const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
      const runtime = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null;

      return (
        <div className={styles.page}>
          {/* Back nav */}
          <div className={styles.backNav}>
            <div className="container">
              <Link href="/search" className={styles.backLink}>
                ← Back to Search
              </Link>
            </div>
          </div>

          {/* Backdrop */}
          {backdrop && (
            <div className={styles.backdrop}>
              <Image src={backdrop} alt="" fill className={styles.backdropImg} priority />
              <div className={styles.backdropOverlay} />
            </div>
          )}

          {/* Hero */}
          <div className={styles.hero}>
            <div className={`container ${styles.heroInner}`}>
              {/* Poster */}
              <div className={styles.posterWrap}>
                {poster ? (
                  <Image
                    src={poster}
                    alt={`${movie.title} poster`}
                    fill
                    className={styles.posterImg}
                    priority
                  />
                ) : (
                  <div className={styles.posterPlaceholder}>🎬</div>
                )}
              </div>

              {/* Meta */}
              <div className={styles.meta}>
                <div className={styles.metaBadges}>
                  <span className={styles.typePill}>Movie</span>
                  {movie.status && (
                    <span className={styles.statusPill}>{movie.status}</span>
                  )}
                </div>

                <h1 className={styles.title}>{movie.title}</h1>

                {movie.tagline && (
                  <p className={styles.tagline}>&ldquo;{movie.tagline}&rdquo;</p>
                )}

                <div className={styles.facts}>
                  {year && <span>{year}</span>}
                  {runtime && <><span className={styles.dot}>·</span><span>{runtime}</span></>}
                  {movie.vote_average > 0 && (
                    <><span className={styles.dot}>·</span><span>⭐ {movie.vote_average.toFixed(1)}</span></>
                  )}
                </div>

                {movie.genres.length > 0 && (
                  <div className={styles.genres}>
                    {movie.genres.map((g) => (
                      <span key={g.id} className="tag">{g.name}</span>
                    ))}
                  </div>
                )}

                {movie.overview && (
                  <p className={styles.overview}>{movie.overview}</p>
                )}

                {/* Rank CTA — will be interactive in Phase 4 */}
                <div className={styles.rankCta}>
                  <Link href="/login" className="btn btn-primary">
                    🐐 Rank This Movie
                  </Link>
                  <p className={styles.rankHint}>Log in to add to your collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ── TV Show ──────────────────────────────────────── */
    const show = await getTvShow(id);
    const poster = tmdbImage(show.poster_path, 'w500');
    const backdrop = tmdbImage(show.backdrop_path, 'w1280');
    const year = show.first_air_date ? show.first_air_date.slice(0, 4) : '';

    // Filter out season 0 (specials) from main list
    const mainSeasons = show.seasons.filter((s) => s.season_number > 0);

    return (
      <div className={styles.page}>
        <div className={styles.backNav}>
          <div className="container">
            <Link href="/search" className={styles.backLink}>← Back to Search</Link>
          </div>
        </div>

        {backdrop && (
          <div className={styles.backdrop}>
            <Image src={backdrop} alt="" fill className={styles.backdropImg} priority />
            <div className={styles.backdropOverlay} />
          </div>
        )}

        <div className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.posterWrap}>
              {poster ? (
                <Image src={poster} alt={`${show.name} poster`} fill className={styles.posterImg} priority />
              ) : (
                <div className={styles.posterPlaceholder}>📺</div>
              )}
            </div>

            <div className={styles.meta}>
              <div className={styles.metaBadges}>
                <span className={styles.typePill}>TV Show</span>
                {show.status && <span className={styles.statusPill}>{show.status}</span>}
                {show.in_production && <span className={styles.activePill}>Airing</span>}
              </div>

              <h1 className={styles.title}>{show.name}</h1>

              {show.tagline && <p className={styles.tagline}>&ldquo;{show.tagline}&rdquo;</p>}

              <div className={styles.facts}>
                {year && <span>{year}</span>}
                <span className={styles.dot}>·</span>
                <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                <span className={styles.dot}>·</span>
                <span>{show.number_of_episodes} Episodes</span>
                {show.vote_average > 0 && (
                  <><span className={styles.dot}>·</span><span>⭐ {show.vote_average.toFixed(1)}</span></>
                )}
              </div>

              {show.genres.length > 0 && (
                <div className={styles.genres}>
                  {show.genres.map((g) => (
                    <span key={g.id} className="tag">{g.name}</span>
                  ))}
                </div>
              )}

              {show.overview && <p className={styles.overview}>{show.overview}</p>}

              <div className={styles.rankCta}>
                <Link href="/login" className="btn btn-primary">
                  🐐 Rank This Show
                </Link>
                <p className={styles.rankHint}>Log in to add to your collection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons list */}
        {mainSeasons.length > 0 && (
          <div className={styles.seasonsSection}>
            <div className="container">
              <h2 className={styles.seasonsTitle}>Seasons</h2>
              <div className={styles.seasonsList}>
                {mainSeasons.map((season) => {
                  const sPoster = tmdbImage(season.poster_path, 'w342');
                  return (
                    <Link
                      key={season.id}
                      href={`/title/tv/${id}/season/${season.season_number}`}
                      className={styles.seasonCard}
                    >
                      <div className={styles.seasonPoster}>
                        {sPoster ? (
                          <Image src={sPoster} alt={season.name} fill className={styles.posterImg} />
                        ) : (
                          <div className={styles.posterPlaceholder} style={{ fontSize: '1.5rem' }}>📺</div>
                        )}
                      </div>
                      <div className={styles.seasonInfo}>
                        <span className={styles.seasonName}>{season.name}</span>
                        <span className={styles.seasonMeta}>
                          {season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
                          {season.air_date && ` · ${season.air_date.slice(0, 4)}`}
                        </span>
                        {season.overview && (
                          <p className={styles.seasonOverview}>{season.overview}</p>
                        )}
                      </div>
                      <span className={styles.seasonChevron}>›</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch {
    notFound();
  }
}
