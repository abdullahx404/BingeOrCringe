import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Star } from 'lucide-react';
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
            {title.mediaType === 'movie'
              ? <Film size={32} strokeWidth={1.2} />
              : <Tv size={32} strokeWidth={1.2} />}
          </div>
        )}

        <span className={styles.typeBadge}>
          {title.mediaType === 'movie' ? 'Movie' : 'TV'}
        </span>

        {title.rating > 0 && (
          <span className={styles.rating}>
            <Star size={10} fill="currentColor" />
            {title.rating.toFixed(1)}
          </span>
        )}
      </div>

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
