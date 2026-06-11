import GlobalNav from '@/components/nav/GlobalNav';
import styles from './page.module.css';

export const metadata = {
  title: 'Terms and Conditions — BingeOrCringe',
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <div className={`container ${styles.container}`}>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <p className={styles.lastUpdated}>Last Updated: June 2026</p>

          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using BingeOrCringe ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. User Accounts and Data</h2>
            <p>
              To use certain features of the Platform, you must register for an account. You agree to provide accurate information during the registration process. 
              We collect basic information such as your email address, username, and public profile data to provide our services. 
              Your authentication is securely managed via Supabase, and we do not store raw passwords on our servers.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Content and Conduct</h2>
            <p>
              The Platform allows users to rank movies and TV shows, add custom tags, and share these lists publicly. 
              You are solely responsible for the content you create. You agree not to post content that is illegal, abusive, harassing, or otherwise objectionable. 
              We reserve the right to remove any content or terminate accounts that violate these guidelines without prior notice.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Third-Party Services</h2>
            <p>
              BingeOrCringe utilizes the TMDB (The Movie Database) API to fetch movie and TV show metadata. 
              This product uses the TMDB API but is not endorsed or certified by TMDB. 
              Your use of the Platform is also subject to any terms imposed by these third-party services where applicable.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the Platform (or any part thereof) with or without notice at any time. 
              You agree that BingeOrCringe shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Limitation of Liability</h2>
            <p>
              The Platform and its components are offered for informational and entertainment purposes only. 
              We shall not be responsible or liable for the accuracy, usefulness, or availability of any information transmitted or made available via the site.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
