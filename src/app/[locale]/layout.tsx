import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Sans_Arabic, Martian_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { Analytics } from '@/components/Analytics';
import { MotionProvider } from '@/components/MotionProvider';
import { OrganizationSchema } from '@/components/StructuredData';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { clientMessages } from '@/i18n/copy';
import { localeAlternates, SITE_URL } from '@/lib/seo';
import { DIRECTION, routing, type Locale } from '@/i18n/routing';

import '../globals.css';

/**
 * Display: Array (Fontshare, ITF Free Font License), self-hosted.
 * Built on a dot grid — stems widen from two dots at Regular to four at Bold —
 * and designed for electronic displays. Preloaded: it renders the nameplate,
 * which is above the fold on every page.
 *
 * Array has NO ARABIC, and no dot-matrix Arabic display face exists at retail
 * quality. Arabic headings therefore set in the Arabic text face at Bold rather
 * than in a Latin display face with fallback glyphs — see below.
 */
const array = localFont({
  src: [
    { path: '../../fonts/Array-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/Array-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-array',
  display: 'swap',
  /*
    NOT preloaded, and this was measured both ways rather than assumed.

    Preloading it is the intuitive choice — Array renders the nameplate, which
    is the LCP element — and it made every route WORSE on the mobile profile:
    LCP went 1.72s to 2.57s on the home page and 2.64s to 3.19s on
    /for-retailers. On a throttled link a 52 KB preload competes with the
    stylesheet and the hydration bundle for the same few hundred kilobits, and
    it wins that race at the expense of the things that actually block painting.

    With `display: swap` the nameplate paints immediately in the metric-matched
    fallback and swaps when Array arrives, so LCP is not waiting on the font.
    The Arabic routes get the same benefit for free: Array is never applied
    under :lang(ar), so without a preload link it is never fetched there.
  */
  preload: false,
  /*
    `adjustFontFallback` is left at its default. It synthesises a fallback with
    Array's metrics so the swap does not move the nameplate — disabling it was a
    mistake made while chasing bytes, and it is the setting that keeps CLS at 0
    through the swap.
  */
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
  /*
    No `wdth` axis. It was requested and never used — nothing in the type scale
    or any component sets a width — and carrying a second variable axis cost
    83.8 KB against 27.4 KB for the weight-only file. Add it back only when a
    design actually calls for a width, and re-measure when doing so.
  */
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
  /*
    Two static instances rather than the full variable range. The scale uses
    exactly two weights here — 400 for --text-data, 500 for the readouts — and
    the variable file carried the whole 100–800 range at 111 KB to serve them.
  */
  weight: ['400', '500'],
});

/**
 * Arabic: IBM Plex Sans Arabic, by Boutros Fonts.
 *
 * A REAL ARABIC TYPEFACE, drawn for Arabic — not Archivo with fallback glyphs,
 * which is what produces the disconnected, wrongly-proportioned Arabic that
 * signals to an Egyptian reader that they were an afterthought.
 *
 * Why this one against Array and Archivo:
 * - It was drawn as the Arabic member of an ENGINEERING type system. That is
 *   the same brief as this site, and it means the two scripts share an intent
 *   rather than merely coexisting.
 * - Near-monolinear, low stroke contrast, on a Naskh skeleton. Archivo is an
 *   even-weight grotesque. Set side by side neither script looks drawn while
 *   the other looks built — the usual failure when a humanist Arabic is bolted
 *   onto a technical Latin.
 * - Open apertures and large counters, which is what survives 375px on a phone
 *   in a store car park. Several better-looking Arabic faces close up and fill
 *   in at that size.
 * - Static weights that map onto the existing scale, and a family-native Latin
 *   for the mixed strings — model numbers, PET, m² — that appear inside Arabic
 *   sentences.
 *
 * NOT YET APPROVED. CLAUDE.md requires a native reader to review specimens
 * before an Arabic face is settled, and this has not had that review. It is a
 * defensible recommendation, not a decision.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
  // Preloaded only where it is the primary text face; see below.
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    /*
      Required for the generated Open Graph cards: without it Next emits a
      relative og:image URL, which no social platform will fetch. Every page's
      canonical and alternates are absolute for the same reason.
    */
    metadataBase: new URL(SITE_URL),
    title: { default: t('name'), template: `%s — ${t('name')}` },
    description: t('descriptor'),
    alternates: { canonical: '/', languages: localeAlternates('/') },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never disable zoom.
  maximumScale: 5,
  themeColor: '#383f43',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering of a localised route.
  setRequestLocale(locale);

  const direction = DIRECTION[locale as Locale];
  /* Only what a client component reads crosses into the document. */
  const messages = clientMessages(await getMessages());

  return (
    <html
      lang={locale}
      /*
        The single most important line for Arabic. `dir` on the root drives
        every logical property in the stylesheet — margins, padding, borders,
        text alignment, flex and grid flow — so the layout mirrors from one
        attribute rather than from a parallel set of RTL rules.
      */
      dir={direction}
      className={`${array.variable} ${archivo.variable} ${martianMono.variable} ${plexArabic.variable}`}
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
        {/*
          Organization and Product JSON-LD, once per document. Every property is
          dropped rather than guessed while its fact is a PLACEHOLDER — see the
          component.
        */}
        <OrganizationSchema locale={locale as Locale} />
        <Analytics />
        <NextIntlClientProvider messages={messages}>
          <SkipLink />
          <MotionProvider>
            <div className="flex min-h-dvh flex-col">
              <Header />
              {/* Pages own their <main> so each can label its own landmark. */}
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function SkipLink() {
  const t = await getTranslations('a11y');
  return (
    <a
      href="#main"
      /*
        Every page's <main> carries tabIndex={-1}. Without it the browser scrolls
        to the anchor but leaves focus on the skip link, so the next Tab returns
        to the header and the link achieves nothing for the keyboard user it
        exists for. Measured: focus was on `body` after activating it.
      */
      /* `start` rather than `left`: it follows the reading direction. */
      className="sr-only focus:not-sr-only focus:absolute focus:start-sm focus:top-sm focus:z-50 focus:bg-action focus:px-md focus:py-sm focus:text-label focus:text-on-action focus:uppercase"
    >
      {t('skipToContent')}
    </a>
  );
}
