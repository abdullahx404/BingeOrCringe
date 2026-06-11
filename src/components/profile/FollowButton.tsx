'use client';

import { useState, useTransition } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';

interface Props {
  followingId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ followingId, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollowToggle = () => {
    // Optimistic UI update
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);

    startTransition(async () => {
      try {
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followingId,
            action: newStatus ? 'follow' : 'unfollow',
          }),
        });
        
        if (!res.ok) {
          // Revert on error
          setIsFollowing(!newStatus);
        }
      } catch (e) {
        // Revert on error
        setIsFollowing(!newStatus);
      }
    });
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isPending}
      className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-full)', width: '100%' }}
    >
      {isFollowing ? (
        <>
          <UserMinus size={16} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus size={16} />
          Follow
        </>
      )}
    </button>
  );
}
