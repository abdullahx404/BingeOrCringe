import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'BingeOrCringe - Rank Movies Your Way',
    template: '%s | BingeOrCringe',
  },
  description:
    'Curate your cinematic journey. Drop your favorite movies and shows into the tiers they truly deserve: Goated, Binge, Mid, Cringe, or Trash.',
  keywords: ['movie ranking', 'tier list', 'movies', 'tv shows', 'watchlist', 'social', 'film'],
  authors: [{ name: 'BingeOrCringe' }],
  openGraph: {
    title: 'BingeOrCringe',
    description:
      'Curate your cinematic journey. Rank your obsessions and share your hot takes with the world.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BingeOrCringe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BingeOrCringe',
    description: 'Curate your cinematic journey. Rank your obsessions and share your hot takes.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080810',
};

import Footer from '@/components/nav/Footer';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import ScrollToTop from '@/components/ScrollToTop';

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
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
          <Footer />
        </div>
        <Toaster 
          position="top-center" 
          theme="dark" 
          richColors
          style={{ zIndex: 999999 }}
          toastOptions={{
            style: {
              background: '#16162a', // var(--bg-card)
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f0f0ff',
              zIndex: 999999,
            },
            className: 'solid-toast'
          }}
        />
      </body>
    </html>
  );
}
