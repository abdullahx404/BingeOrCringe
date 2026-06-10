import { Crown, Play, Minus, ThumbsDown, Trash2, Search, Tag, Globe, Clapperboard } from 'lucide-react';
import styles from './page.module.css';
import { TIER_CONFIG, TIERS } from '@/lib/utils/tiers';
import { TAGS } from '@/lib/utils/tags';

const TIER_ICONS = { Crown, Play, Minus, ThumbsDown, Trash2 } as const;

const STEPS = [
  {
    step: '01',
    Icon: Search,
    title: 'Search Any Title',
    desc: 'Find any movie, show, season, or episode. The search is fast and the database is massive.',
  },
  {
    step: '02',
    Icon: Crown,
    title: 'Pick a Tier',
    desc: 'Drop it where it belongs — Goated, Binge, Mid, Cringe, or Trash. No overthinking.',
  },
  {
    step: '03',
    Icon: Tag,
    title: 'Tag the Vibe',
    desc: 'Add optional tags like Brainrot, Peak Fiction, or Emotional Damage for extra context.',
  },
  {
    step: '04',
    Icon: Globe,
    title: 'Share Your List',
    desc: 'Make your collection public. Let people know what actually slaps and what to avoid.',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>
            <Clapperboard size={14} />
            Movie Rankings, Reimagined
          </div>

          <h1 className={styles.heroTitle}>
            Stop Rating.
            <br />
            <span className="text-gradient">Start Ranking.</span>
          </h1>

          <p className={styles.heroSub}>
            3.7 stars tells you nothing.{' '}
            <strong>Goated, Binge, Mid, Cringe, or Trash</strong> — now that's an actual opinion.
          </p>

          <div className={styles.heroCta}>
            <a href="/signup" className="btn btn-primary btn-lg">
              Start Ranking Free
            </a>
            <a href="/search" className="btn btn-secondary btn-lg">
              Browse Titles
            </a>
          </div>

          {/* Tier preview strip */}
          <div className={styles.tierStrip}>
            {TIERS.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
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
                  {Icon && <Icon size={14} />}
                  <span className={styles.tierLabel}>{cfg.label.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.heroGlow} aria-hidden="true" />
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className="container">
          <p className={styles.sectionEyebrow}>How it works</p>
          <h2 className={styles.sectionTitle}>Four Steps. That&apos;s It.</h2>

          <div className={styles.stepsGrid}>
            {STEPS.map(({ step, Icon, title, desc }) => (
              <div key={step} className={`card ${styles.stepCard}`}>
                <span className={styles.stepNumber}>{step}</span>
                <div className={styles.stepIconWrap}>
                  <Icon size={20} />
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tags Preview ────────────────────────────────── */}
      <section className={styles.tagsSection}>
        <div className="container">
          <p className={styles.sectionEyebrow}>Go deeper</p>
          <h2 className={styles.sectionTitle}>Tag the Vibe</h2>
          <p className={styles.sectionDesc}>
            Tiers not enough? Add tags for when you need to say <em>exactly</em> what kind of watch it was.
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
          <h2 className={styles.sectionTitle}>Five Tiers. No Debates.</h2>

          <div className={styles.tiersGrid}>
            {TIERS.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const Icon = TIER_ICONS[cfg.icon as keyof typeof TIER_ICONS];
              return (
                <div
                  key={tier}
                  className={styles.tierCard}
                  style={{ borderColor: `${cfg.color}25` }}
                >
                  <div className={styles.tierCardIcon} style={{ color: cfg.color }}>
                    {Icon && <Icon size={28} />}
                  </div>
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
              Make a free account. Start ranking. Your list, your rules.
            </p>
            <a href="/signup" className="btn btn-primary btn-lg">
              Get Started — Free
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>
            <Clapperboard size={20} className={styles.logoMark} />
            <span className={styles.logoText}>BingeOrCringe</span>
          </div>
          <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} BingeOrCringe</p>
        </div>
      </footer>
    </main>
  );
}
