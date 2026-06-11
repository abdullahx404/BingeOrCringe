import styles from './page.module.css';

export default function TitleLoading() {
  return (
    <main className={styles.main}>
      <div className={`skeleton ${styles.heroContainer}`} style={{ height: '600px', width: '100%' }}>
        <div className={styles.heroOverlay} />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`skeleton`} style={{ width: '300px', aspectRatio: '2/3', borderRadius: '12px' }} />
            <div className={styles.heroInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={`skeleton`} style={{ width: '60%', height: '48px' }} />
              <div className={`skeleton`} style={{ width: '40%', height: '24px' }} />
              <div className={`skeleton`} style={{ width: '80%', height: '100px' }} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <div className={`skeleton`} style={{ width: '120px', height: '40px', borderRadius: '20px' }} />
                <div className={`skeleton`} style={{ width: '120px', height: '40px', borderRadius: '20px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
