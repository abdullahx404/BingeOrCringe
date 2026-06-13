'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to the absolute top of the page on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Also scroll the body/document element just in case
    document.body.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
