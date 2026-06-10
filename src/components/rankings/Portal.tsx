'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

/**
 * Renders children directly into document.body via a React Portal.
 * This bypasses any CSS stacking context from ancestor elements,
 * ensuring modals/overlays always appear on top of everything.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
