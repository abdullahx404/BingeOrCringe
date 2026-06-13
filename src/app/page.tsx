import Link from 'next/link';
import Image from 'next/image';
import { Search, ListChecks, Share2, Crown, Play, Minus, ThumbsDown, Trash2, Users, MessageSquare } from 'lucide-react';
import GlobalNav from '@/components/nav/GlobalNav';
import { getTrending, tmdbImage } from '@/lib/tmdb/client';
import { createClient } from '@/lib/supabase/server';
import ActivityFeed from '@/components/feed/ActivityFeed';
import styles from './page.module.css';

export const metadata = {
  title: 'BingeOrCringe - Rank Movies Your Way',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className={styles.page}>
        <div className={styles.navWrapper}>
          <GlobalNav />
        </div>
        <main className={styles.main} style={{ paddingTop: '100px' }}>
          <ActivityFeed userId={user.id} />
        </main>
      </div>
    );
  }

  let trendingItems: any[] = [];
  try {
    const res = await getTrending();
    // Grab the first 10 for the marquee
    trendingItems = res.results.slice(0, 10);
  } catch (err) {
    console.error('Failed to fetch trending for landing page', err);
  }

  return (
    <div className={styles.page}>
      <div className={styles.navWrapper}>
        <GlobalNav />
      </div>

      <main className={styles.main}>
        {/* ─── Hero Section ─── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroContainer}`}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Rank your obsessions. <br />
                <span className={styles.accentText}>Share your hot takes.</span>
              </h1>
              <p className={styles.heroSub}>
                Forget star ratings. Drop movies and shows into the tiers they actually deserve: Goated, Binge, Mid, Cringe, or Trash.
              </p>
              <div className={styles.heroActions}>
                <Link href="/signup" className={`btn btn-primary ${styles.ctaBtn}`}>Start Ranking</Link>
                <Link href="/search" className={`btn btn-secondary ${styles.ctaBtn}`}>Browse Titles</Link>
              </div>
            </div>

            {/* Floating Tier Preview Visual */}
            <div className={styles.heroVisual}>
              <div className={styles.floatingCard} style={{ '--delay': '0s', '--y': '-10px', borderColor: 'var(--tier-goated)' } as React.CSSProperties}>
                <div className={styles.tierPill} style={{ background: 'var(--tier-goated)', color: '#000' }}>
                  <Crown size={14} /> Goated
                </div>
                <span>Inception</span>
              </div>
              <div className={styles.floatingCard} style={{ '--delay': '1s', '--y': '15px', borderColor: 'var(--tier-binge)' } as React.CSSProperties}>
                <div className={styles.tierPill} style={{ background: 'var(--tier-binge)', color: '#000' }}>
                  <Play size={14} /> Binge
                </div>
                <span>Breaking Bad</span>
              </div>
              <div className={styles.floatingCard} style={{ '--delay': '2s', '--y': '-5px', borderColor: 'var(--tier-trash)' } as React.CSSProperties}>
                <div className={styles.tierPill} style={{ background: 'var(--tier-trash)', color: '#000' }}>
                  <Trash2 size={14} /> Trash
                </div>
                <span>That one bad movie</span>
              </div>
            </div>
          </div>
          
          {/* Subtle background glow */}
          <div className={styles.heroGlow} />
        </section>

        {/* ─── Trending Marquee ─── */}
        {trendingItems.length > 0 && (
          <section className={styles.trendingSection}>
            <div className="container">
              <h3 className={styles.sectionTitleSmall}>Trending This Week</h3>
            </div>
            <div className={styles.marquee}>
              <div className={styles.marqueeTrack}>
                {/* Double the items for seamless loop */}
                {[...trendingItems, ...trendingItems].map((item, idx) => {
                  const title = item.title || item.name;
                  const posterUrl = tmdbImage(item.poster_path, 'w342');
                  return (
                    <div key={`${item.id}-${idx}`} className={styles.marqueeItem}>
                      {posterUrl ? (
                        <Image src={posterUrl} alt={title} width={120} height={180} className={styles.marqueeImg} />
                      ) : (
                        <div className={styles.marqueePlaceholder}>{title}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ─── Features ─── */}
        <section className={styles.howItWorks}>
          <div className="container">
            <h2 className={styles.sectionTitleCenter}>Everything You Need</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><Search size={28} /></div>
                <h3>Search & Discover</h3>
                <p>Find any movie, TV show, season, or specific episode using our TMDB-powered database.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><ListChecks size={28} /></div>
                <h3>Rank & Tag</h3>
                <p>Assign it to a tier. Is it Goated? Is it Trash? Add custom tags to categorize exactly why.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><Share2 size={28} /></div>
                <h3>Share Your Profile</h3>
                <p>Generate your public profile. Share your definitive tier list and debate with friends.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><Crown size={28} /></div>
                <h3>Custom Tier Lists</h3>
                <p>Create thematic lists like "Best Sci-Fi" or "Worst Sequels" and rank them exactly how you want.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><Users size={28} /></div>
                <h3>Follow Friends</h3>
                <p>Follow other users to see their hot takes, rankings, and what they are currently watching on your feed.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrap}><MessageSquare size={28} /></div>
                <h3>Chat & Debate</h3>
                <p>Slide into the DMs. Discuss, defend, and debate your rankings directly with your friends.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
