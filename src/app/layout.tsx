import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'BingeOrCringe — Rank Movies Your Way',
    template: '%s | BingeOrCringe',
  },
  description:
    'Forget star ratings — rank movies and shows into tiers that actually reflect your taste. Goated, Binge, Mid, Cringe, or Trash.',
  keywords: ['movie ranking', 'tier list', 'movies', 'tv shows', 'watchlist', 'social'],
  authors: [{ name: 'BingeOrCringe' }],
  openGraph: {
    title: 'BingeOrCringe — Rank Movies Your Way',
    description:
      'Forget star ratings. Rank movies into tiers: Goated, Binge, Mid, Cringe, or Trash.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BingeOrCringe',
    description: 'Rank movies your way. Goated, Binge, Mid, Cringe, or Trash.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080810',
};

import Footer from '@/components/nav/Footer';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <NextTopLoader
          color="var(--accent)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--accent),0 0 5px var(--accent)"
        />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
          <Footer />
        </div>
        <Toaster position="bottom-center" theme="dark" />
      </body>
    </html>
  );
}
