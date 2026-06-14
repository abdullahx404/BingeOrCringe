import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="Logo" style={{ height: '36px', width: 'auto' }} />
          <img src="/logo-text.svg" alt="BingeOrCringe" style={{ height: '24px', width: 'auto', marginTop: '3px' }} />
        </Link>
      </header>

      <div className={styles.glow} aria-hidden="true" />

      <main className={styles.main}>{children}</main>

    </div>
  );
}
