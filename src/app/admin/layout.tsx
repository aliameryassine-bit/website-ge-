import type { Metadata, Viewport } from 'next';

import '../globals.css';

/**
 * Root layout for the admin dashboard.
 *
 * /admin sits outside the [locale] segment, so it needs its own root layout —
 * it does not inherit the localised one. That is the point: this is a
 * single-language internal tool, and putting it through the translation
 * pipeline would add hundreds of strings to a translator's worklist for a page
 * no customer will ever open.
 *
 * No header, no footer, no analytics. The dashboard should not report its own
 * traffic into the numbers it is displaying.
 */

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#383f43',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-dvh bg-ground text-ink antialiased">{children}</body>
    </html>
  );
}
