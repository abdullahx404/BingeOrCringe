import Link from 'next/link';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      {/* Minimal header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>🎬</span>
          <span className={styles.logoText}>BingeOrCringe</span>
        </Link>
      </header>

      {/* Background glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Page content */}
      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>
          &copy; {new Date().getFullYear()} BingeOrCringe &mdash; All rights reserved.
        </p>
      </footer>
    </div>
  );
}
