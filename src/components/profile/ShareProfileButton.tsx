'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface Props {
  username: string;
}

export default function ShareProfileButton({ username }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-secondary btn-sm"
      style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)' }}
      title="Copy Profile Link"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      <span>{copied ? 'Copied!' : 'Share Profile'}</span>
    </button>
  );
}
