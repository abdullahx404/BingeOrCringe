import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';
import GlobalNav from '@/components/nav/GlobalNav';
import styles from './page.module.css';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, avatar_url, is_public')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // If somehow missing, fallback to defaults
    redirect('/');
  }

  const initialData = {
    display_name: profile.display_name,
    username: profile.username,
    avatar_url: profile.avatar_url,
    is_public: profile.is_public,
  };

  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your profile and privacy.</p>

          <ProfileSettingsForm initialData={initialData} />
        </div>
      </main>
    </div>
  );
}
