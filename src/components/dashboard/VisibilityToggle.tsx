'use client';

import { useTransition } from 'react';
import { Globe, Lock } from 'lucide-react';
import { toggleVisibility } from '@/lib/profile/actions';
import styles from './VisibilityToggle.module.css';

interface Props {
  isPublic: boolean;
}

export default function VisibilityToggle({ isPublic }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleVisibility(!isPublic);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`${styles.btn} ${isPublic ? styles.public : styles.private}`}
      aria-label={`Collection is ${isPublic ? 'public' : 'private'}. Click to make ${isPublic ? 'private' : 'public'}.`}
      title={`Currently ${isPublic ? 'public' : 'private'} — click to toggle`}
      id="visibility-toggle"
    >
      {isPending ? (
        <span className={styles.spinner} />
      ) : isPublic ? (
        <Globe size={14} />
      ) : (
        <Lock size={14} />
      )}
      <span>{isPending ? '…' : isPublic ? 'Public' : 'Private'}</span>
    </button>
  );
}
