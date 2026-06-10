import styles from './page.module.css';
import { TIER_CONFIG, TIERS } from '@/lib/utils/tiers';
import { TAGS } from '@/lib/utils/tags';

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>🎬 Movie Rankings, Reimagined</div>

          <h1 className={styles.heroTitle}>
            Stop Rating.
            <br />
            <span className="text-gradient">Start Ranking.</span>
          </h1>

          <p className={styles.heroSub}>
            Forget 3.7 stars out of 5. Rank movies into tiers that actually say something —
            <strong> Goated, Binge, Mid, Cringe, or Trash.</strong>
          </p>

          <div className={styles.heroCta}>
            <a href="/signup" className="btn btn-primary btn-lg">
              Start Ranking Free
            </a>
            <a href="/search" className="btn btn-secondary btn-lg">
              Browse Movies
            </a>
          </div>

          {/* Tier preview strip */}
          <div className={styles.tierStrip}>
            {TIERS.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              return (
                <div
                  key={tier}
                  className={styles.tierChip}
                  style={{
                    color: cfg.color,
                    background: cfg.bgColor,
                    borderColor: `${cfg.color}30`,
                  }}
                >
                  <span className={styles.tierEmoji}>{cfg.emoji}</span>
                  <span className={styles.tierLabel}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Background gradient glow */}
        <div className={styles.heroGlow} aria-hidden="true" />
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className="container">
          <p className={styles.sectionEyebrow}>Simple as that</p>
          <h2 className={styles.sectionTitle}>How BingeOrCringe Works</h2>

          <div className={styles.stepsGrid}>
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Search Any Title',
                desc: 'Search from millions of movies, shows, seasons, and episodes powered by TMDB.',
              },
              {
                step: '02',
                icon: '🐐',
                title: 'Pick Your Tier',
                desc: 'Is it Goated, Binge-worthy, Mid, Cringe, or straight Trash? You decide.',
              },
              {
                step: '03',
                icon: '🏷️',
                title: 'Add Vibes',
                desc: 'Tag it with Brainrot, Peak Fiction, Emotional Damage — or keep it simple.',
              },
              {
                step: '04',
                icon: '🌐',
                title: 'Share Your List',
                desc: 'Make your collection public and let others discover what to watch (or avoid).',
              },
            ].map((item) => (
              <div key={item.step} className={`card ${styles.stepCard}`}>
                <span className={styles.stepNumber}>{item.step}</span>
                <span className={styles.stepIcon}>{item.icon}</span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tags Preview ────────────────────────────────── */}
      <section className={styles.tagsSection}>
        <div className="container">
          <p className={styles.sectionEyebrow}>Express yourself</p>
          <h2 className={styles.sectionTitle}>Add Vibes with Tags</h2>
          <p className={styles.sectionDesc}>
            Go beyond tiers — add tags that capture the actual feeling of watching something.
          </p>

          <div className={styles.tagsCloud}>
            {TAGS.map((tag) => (
              <span key={tag} className={`tag ${styles.tagItem}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers Explained ─────────────────────────────── */}
      <section className={styles.tiersSection}>
        <div className="container">
          <p className={styles.sectionEyebrow}>The tier system</p>
          <h2 className={styles.sectionTitle}>5 Tiers. No Debates.</h2>

          <div className={styles.tiersGrid}>
            {TIERS.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              return (
                <div
                  key={tier}
                  className={styles.tierCard}
                  style={{ borderColor: `${cfg.color}25` }}
                >
                  <div className={styles.tierCardEmoji}>{cfg.emoji}</div>
                  <h3 className={styles.tierCardName} style={{ color: cfg.color }}>
                    {cfg.label}
                  </h3>
                  <p className={styles.tierCardDesc}>{cfg.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaTitle}>Ready to rank?</h2>
            <p className={styles.ctaDesc}>
              Create your free account and start ranking movies the way you actually talk about them.
            </p>
            <a href="/signup" className="btn btn-primary btn-lg">
              Get Started — It&apos;s Free
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>
            <span className={styles.logoMark}>🎬</span>
            <span className={styles.logoText}>BingeOrCringe</span>
          </div>
          <p className={styles.footerNote}>
            Movie data provided by{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} BingeOrCringe</p>
        </div>
      </footer>
    </main>
  );
}
