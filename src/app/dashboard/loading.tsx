import { Film } from 'lucide-react';
import styles from './page.module.css'; // Reuse dashboard page styles

export default function DashboardLoading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className="container">
          <div className={styles.welcome} style={{ opacity: 0.5 }}>
            <div className={`skeleton`} style={{ width: '250px', height: '40px', marginBottom: '8px' }} />
            <div className={`skeleton`} style={{ width: '150px', height: '24px' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`skeleton`} style={{ width: '80px', height: '32px', borderRadius: '16px' }} />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className={`skeleton`} style={{ width: '200px', height: '30px', marginBottom: '16px', borderRadius: '4px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className={`skeleton`} style={{ width: '100%', aspectRatio: '2/3', borderRadius: '12px' }} />
                      <div className={`skeleton`} style={{ width: '80%', height: '20px', borderRadius: '4px' }} />
                      <div className={`skeleton`} style={{ width: '50%', height: '16px', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
