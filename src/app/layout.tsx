import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { EntryDrawer } from '@/components/EntryDrawer';
import { MotionPrefs } from '@/components/MotionPrefs';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif-display', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

const description =
  'An interactive atlas of 326 surveillance and data-collection systems: how much of an ordinary day is observed, recorded, analyzed, inferred, or stored, and how we got here.';

export const metadata: Metadata = {
  metadataBase: new URL('https://invisible-infrastructure.netlify.app'),
  title: { default: 'The Invisible Infrastructure', template: '%s · The Invisible Infrastructure' },
  description,
  openGraph: { title: 'The Invisible Infrastructure', description, type: 'website' },
  twitter: { card: 'summary', title: 'The Invisible Infrastructure', description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#0b0b0c', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <MotionPrefs />
        <Nav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <EntryDrawer />
        </Suspense>
      </body>
    </html>
  );
}
