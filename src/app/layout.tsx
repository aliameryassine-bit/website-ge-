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
    <html
      lang="en"
      className={`${array.variable} ${archivo.variable} ${martianMono.variable}`}
      /*
        The data-js script below sets an attribute on this element before React
        hydrates, which React reports as an attribute mismatch it "won't patch
        up". The mismatch is intentional and one-directional — the client has an
        attribute the server could not have sent — so it is suppressed here
        rather than removed, which is the same pattern a theme script uses.
        Scoped to this element's own attributes; it does not affect children.
      */
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-ground text-ink antialiased">
        {/*
          Marks the document as JavaScript-capable BEFORE first paint.

          Progressive-enhancement layouts that depend on a runtime — the pinned
          technology sequence is the one here — must be able to claim their
          final height in the first paint. Setting a flag from a mount effect
          instead costs a layout shift: the sequence measured CLS 0.1043,
          straight through the 0.1 threshold, because nine steps grew from auto
          to 450px after hydration while the section was on screen.

          Parser-blocking and one line, so it runs before anything renders.
          Without JavaScript the attribute is never set and those layouts fall
          back to their plain-list form, which is the intent.
        */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.js="1"' }} />
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
