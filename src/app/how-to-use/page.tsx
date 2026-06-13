import GlobalNav from '@/components/nav/GlobalNav';

export const metadata = { title: 'How To Use - BingeOrCringe' };

export default function HowToUsePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalNav />
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1, maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>How To Use</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--text-secondary)' }}>
          
          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>1. Search & Discover</h2>
            <p style={{ lineHeight: 1.6 }}>
              Use the search bar at the top to find any movie, TV show, season, or even a specific episode. We pull real-time data so you can find exactly what you just watched.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>2. Rank & Tag</h2>
            <p style={{ lineHeight: 1.6 }}>
              Click "Rank This" on any title. Choose one of our 5 tiers:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)', lineHeight: 1.6 }}>
              <li><strong>GOATED</strong>: Absolute cinema. Masterpiece.</li>
              <li><strong>BINGE</strong>: Great watch, could finish it in one sitting.</li>
              <li><strong>MID</strong>: It was okay. Nothing special.</li>
              <li><strong>CRINGE</strong>: Hard to watch, mostly bad.</li>
              <li><strong>TRASH</strong>: Complete waste of time. Skip.</li>
            </ul>
            <p style={{ lineHeight: 1.6, marginTop: 'var(--space-2)' }}>
              You can also add up to 3 optional tags to give more context to your ranking.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>3. Custom Lists</h2>
            <p style={{ lineHeight: 1.6 }}>
              Want to organize your Horror movies or Anime? Create Custom Lists from your dashboard. When ranking a title, you can instantly add it to one or more of your Custom Lists. You can keep these lists Private or make them Public to share with friends.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>4. Share Your Profile</h2>
            <p style={{ lineHeight: 1.6 }}>
              Your entire collection is displayed on your public profile. Share your profile link with others so they can see your hot takes and tier distributions!
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>5. Follow Friends</h2>
            <p style={{ lineHeight: 1.6 }}>
              Keep up with your friends' latest movie binges. Follow other users to see their rankings and hot takes directly on your Activity Feed.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>6. Chat & Debate</h2>
            <p style={{ lineHeight: 1.6 }}>
              Disagree with a friend's trash ranking? Jump into their DMs! Use our built-in real-time chat to discuss and debate rankings.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
