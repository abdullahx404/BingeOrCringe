import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followingId, action } = await req.json();

    if (!followingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    if (action === 'follow') {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: followingId });

      if (error) {
        if (error.code === '23505') {
           // Already following
           return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // create notification
      await supabase.from('notifications').insert({
        user_id: followingId,
        actor_id: user.id,
        type: 'follow'
      });

      return NextResponse.json({ success: true });
    } else if (action === 'unfollow') {
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: user.id, following_id: followingId });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // delete notification (optional, to keep it clean)
      await supabase.from('notifications')
        .delete()
        .match({ user_id: followingId, actor_id: user.id, type: 'follow' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
