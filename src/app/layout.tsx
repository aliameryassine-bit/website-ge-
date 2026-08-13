import type { Metadata, Viewport } from 'next';
import { Archivo, Martian_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import { MotionProvider } from '@/components/MotionProvider';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { COPY } from '@/content/copy';

import './globals.css';

/**
 * Display: Array (Fontshare, ITF Free Font License), self-hosted.
 * Built on a dot grid — stems widen from two dots at Regular to four at Bold —
 * and designed for electronic displays. Preloaded: it renders the nameplate,
 * which is above the fold on every page.
 */
const array = localFont({
  src: [
    { path: '../fonts/Array-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Array-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-array',
  display: 'swap',
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/**
 * Body: Archivo. Designed for signage and high-performance small-size
 * setting. Variable weight axis, one file. Not preloaded — body copy can
 * tolerate a swap, and preloading three families would defeat the point.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  preload: false,
  axes: ['wdth'],
});

/**
 * Technical: Martian Mono. Wide grotesque monospace, tabular figures. Every
 * numeral and unit. Not preloaded.
 */
const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: COPY.site.name,
    template: `%s — ${COPY.site.name}`,
  },
  description: COPY.site.descriptor,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never disable zoom.
  maximumScale: 5,
  themeColor: '#383f43',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${array.variable} ${archivo.variable} ${martianMono.variable}`}>
      <body className="min-h-dvh bg-ground text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-sm focus:left-sm focus:z-50 focus:bg-action focus:px-md focus:py-sm focus:text-label focus:text-on-action focus:uppercase"
        >
          {COPY.a11y.skipToContent}
        </a>
        <MotionProvider>
          <div className="flex min-h-dvh flex-col">
            <Header />
            {/* Pages own their <main> so each can label its own landmark. */}
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
