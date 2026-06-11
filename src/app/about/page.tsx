import GlobalNav from '@/components/nav/GlobalNav';

export const metadata = { title: 'About - BingeOrCringe' };

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalNav />
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1, maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>About BingeOrCringe</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <p>
            BingeOrCringe is the ultimate platform for movie and TV show enthusiasts who have strong opinions and aren't afraid to share them. Whether a show is absolute cinema (GOATED) or a complete waste of time (TRASH), we give you the tools to organize, rank, and showcase your watch history.
          </p>
          <p>
            Tired of boring 5-star rating systems? So are we. BingeOrCringe lets you drop titles into 5 distinct tiers, slap custom tags on them (like "Brainrot" or "Overrated AF"), and build custom watchlists to share with your friends.
          </p>
          <p>
            Our mission is to make organizing your entertainment as fun as watching it. Built for a generation that values hot takes and aesthetic collections.
          </p>
        </div>
      </main>
    </div>
  );
}
