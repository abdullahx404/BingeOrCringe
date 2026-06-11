import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GlobalNav from '@/components/nav/GlobalNav';
import ChatInterface from '@/components/chat/ChatInterface';
import styles from './page.module.css';

export const metadata = { title: 'Messages | BingeOrCringe' };

export default async function MessagesPage({ searchParams }: { searchParams: { user?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch current user profile
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!currentUser) redirect('/login');

  // If a ?user= param is present, fetch that profile so we can start a chat with them
  let initialActiveProfile = null;
  if (searchParams.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('username', searchParams.user)
      .single();
    if (profile && profile.id !== currentUser.id) {
      initialActiveProfile = profile;
    }
  }

  return (
    <div className={styles.page}>
      <GlobalNav />
      <main className={styles.main}>
        <ChatInterface 
          currentUser={currentUser} 
          initialActiveProfile={initialActiveProfile} 
        />
      </main>
    </div>
  );
}
