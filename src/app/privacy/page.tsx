import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | BingeOrCringe',
  description: 'Privacy Policy for BingeOrCringe',
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8) 24px', color: 'var(--text-normal)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)', color: 'var(--text-bright)' }}>
        Privacy Policy
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: '1.6' }}>
        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>1. Introduction</h2>
          <p>
            Welcome to BingeOrCringe. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>2. Information We Collect</h2>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Personal Information:</strong> When you register via email or Google OAuth, we collect your email address, username, and display name.</li>
            <li><strong>Profile Data:</strong> Information you choose to add to your public profile.</li>
            <li><strong>User Content:</strong> The rankings, tags, and custom watchlists you create on the platform.</li>
            <li><strong>Service Interaction Data:</strong> Information generated through normal interactions with the platform's social and community features, which are processed temporarily to facilitate connectivity.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>3. How We Use Your Information</h2>
          <p style={{ marginBottom: 'var(--space-2)' }}>We use your data exclusively to provide and improve the BingeOrCringe experience. This includes:</p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Authenticating your account and keeping you logged in securely.</li>
            <li>Displaying your public profile, rankings, and lists to other users (unless your profile is set to Private).</li>
            <li>Facilitating social connections and community engagement features.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>4. How We Protect & Retain Your Data</h2>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Security:</strong> Your data is securely stored using Supabase (PostgreSQL), protected by strict Row Level Security (RLS) policies ensuring no one else can modify your private data.</li>
            <li><strong>Data Retention:</strong> Temporary interaction data (such as social community exchanges) is designed to be ephemeral. It is automatically purged and permanently deleted from our database after 24 hours, ensuring a minimal footprint.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>5. Third-Party Services We Use</h2>
          <p style={{ marginBottom: 'var(--space-2)' }}>We do not sell your personal data. However, we use trusted third-party services to run the app:</p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Supabase:</strong> For secure database hosting and authentication.</li>
            <li><strong>Vercel:</strong> For website hosting and server infrastructure.</li>
            <li><strong>Google OAuth:</strong> For optional secure login.</li>
            <li><strong>TMDB (The Movie Database):</strong> We use the TMDB API to search for movie metadata, but we do not share your personal data with them.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>6. Cookies</h2>
          <p>
            We use strictly necessary cookies and local storage tokens provided by Supabase solely to maintain your active login session. We do not use third-party tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-bright)', marginBottom: 'var(--space-2)' }}>7. Your Rights & Account Deletion</h2>
          <p style={{ marginBottom: 'var(--space-2)' }}>
            You have the right to access, update, or permanently delete your personal information at any time.
          </p>
          <p>
            <strong>Account Deletion:</strong> You may permanently delete your account through your Profile Settings. Upon deletion, your username, profile data, rankings, custom lists, and messages are instantly and permanently erased from our servers in a cascaded deletion process. This action cannot be undone.
          </p>
        </section>
      </div>
    </div>
  );
}
