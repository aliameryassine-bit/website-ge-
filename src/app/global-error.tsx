'use client';

import { useEffect } from 'react';

import './globals.css';

/**
 * The last resort: an error in the root layout itself.
 *
 * This replaces the entire document, so it must render its own <html> and
 * <body> — no header, no footer, no providers, no i18n. Anything it depends on
 * is something that can also be broken when it is needed.
 *
 * For that reason the copy here is HARDCODED English rather than read from the
 * message system. Every other string on this site goes through content/copy.ts;
 * this is the one deliberate exception, because a fallback that depends on the
 * translation layer is a fallback that fails when the translation layer is what
 * broke. It is also why the styles are inline design-token values rather than
 * utility classes — if the stylesheet did not load, this page still reads.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(`[global-error] ${error.digest ?? 'no digest'}`, error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          background: '#383f43',
          color: '#c6d9df',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
        }}
      >
        <main style={{ maxWidth: '38rem', margin: '0 auto', display: 'grid', gap: '20px' }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#a8afb3',
            }}
          >
            Green Exchange
          </p>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 700 }}>
            This page could not be loaded.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#a8afb3' }}>
            Something failed before the site could render. Nothing you submitted has been lost — if
            you were part-way through a form, it was not sent, so please try again.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                padding: '0 24px',
                background: '#f0c23c',
                color: '#383f43',
                border: 0,
                borderRadius: 2,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/*
              A plain <a>, not next/link, and the rule is disabled rather than
              satisfied. Link needs the router context, and this boundary exists
              precisely for the case where the root layout — and therefore that
              context — did not come up. A full document navigation is the only
              escape that cannot fail for the same reason the page did.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 24px',
                border: '1px solid rgba(168,175,179,0.6)',
                borderRadius: 2,
                color: '#c6d9df',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
