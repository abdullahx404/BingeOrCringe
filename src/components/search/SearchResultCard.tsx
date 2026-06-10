import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb/client';
import type { NormalizedTitle } from '@/lib/tmdb/types';
import styles from './SearchResultCard.module.css';

interface Props {
  title: NormalizedTitle;
}

export default function SearchResultCard({ title }: Props) {
  const href =
    title.mediaType === 'movie'
      ? `/title/movie/${title.id}`
      : `/title/tv/${title.id}`;

  const poster = tmdbImage(title.posterPath, 'w342');

  return (
    <Link href={href} className={styles.card}>
      {/* Poster */}
      <div className={styles.poster}>
        {poster ? (
          <Image
            src={poster}
            alt={`${title.title} poster`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className={styles.posterImg}
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <span>{title.mediaType === 'movie' ? '🎬' : '📺'}</span>
          </div>
        )}

        {/* Media type badge */}
        <span className={styles.typeBadge}>
          {title.mediaType === 'movie' ? 'Movie' : 'TV'}
        </span>

        {/* Rating */}
        {title.rating > 0 && (
          <span className={styles.rating}>
            ⭐ {title.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.title}>{title.title}</h3>
        {title.year && <p className={styles.year}>{title.year}</p>}
        {title.overview && (
          <p className={styles.overview}>{title.overview}</p>
        )}
      </div>
    </Link>
  );
}
