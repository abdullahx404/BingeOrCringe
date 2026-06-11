import { Clapperboard } from 'lucide-react';
import styles from './page.module.css'; // Reuse search page styles

export default function SearchLoading() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <Clapperboard size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </div>
          <div className={styles.headerSearch}>
            <div className={`skeleton`} style={{ width: '100%', height: '40px', borderRadius: '20px' }} />
          </div>
          <div className={styles.headerLinks}>
            <div className={`skeleton`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`skeleton ${styles.skeletonPoster}`} />
                <div className={`skeleton ${styles.skeletonText}`} />
                <div className={`skeleton ${styles.skeletonTextShort}`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
