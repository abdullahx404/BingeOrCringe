import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <Clapperboard size={20} className={styles.logoIcon} />
          <span className={styles.logoText}>BingeOrCringe</span>
        </Link>
      </header>

      <div className={styles.glow} aria-hidden="true" />

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} BingeOrCringe</p>
      </footer>
    </div>
  );
}
