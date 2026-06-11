'use client';

import { toast } from 'sonner';

export default function ShareListButton({ listId }: { listId: string }) {
  function handleShare() {
    const url = `${window.location.origin}/list/${listId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }

  return (
    <button onClick={handleShare} className="btn btn-secondary btn-sm">
      Share List
    </button>
  );
}
