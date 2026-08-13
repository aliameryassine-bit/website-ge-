import Script from 'next/script';

/**
 * Plausible, loaded first-party through our own domain.
 *
 * PROXIED via the rewrite in next.config.ts rather than loaded from
 * plausible.io. Two reasons, both practical: a third-party script is the thing
 * ad blockers remove, and blocked analytics under-reports exactly the
 * technical, privacy-minded audience an investor deck is aimed at; and a
 * first-party request avoids a second DNS lookup and TLS handshake on a link
 * where those cost real milliseconds.
 *
 * RENDERS NOTHING WHEN UNCONFIGURED. No domain, no script — rather than a
 * script pointing at a domain that does not exist in any account, which fails
 * on every page load and reports nothing while looking installed.
 *
 * `afterInteractive` on purpose: analytics never competes with the content or
 * with hydration for the main thread. A pageview arriving 200ms later costs
 * nothing; a slower LCP costs a reader.
 *
 * The inline stub queues events fired before the script arrives, so a fast
 * clicker is still counted.
 *
 * TAGGED-EVENTS build, not the plain one. It is a superset — it keeps the
 * window.plausible() API the client components use, and adds class-based
 * tagging, which is what lets the audience fork stay a server component with no
 * JavaScript at all. Instrumenting the site's primary routing device should not
 * cost it the property that makes it unbreakable.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <>
      <Script
        defer
        data-domain={domain}
        /*
          `data-api` is required when proxying. Without it the script posts to
          plausible.io directly, which undoes the proxy and hands the blockers
          back the request they were being kept away from.
        */
        data-api="/stats/event"
        src="/stats/script.tagged-events.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-queue" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
      </Script>
    </>
  );
}

export default Analytics;
