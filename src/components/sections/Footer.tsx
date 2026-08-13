import Link from 'next/link';

import { COPY } from '@/content/copy';
import { FACTS, type FactId } from '@/content/facts';

/**
 * Global footer.
 *
 * Registration details come from content/facts.ts and are rendered with their
 * status visible, exactly like every other figure on the site. A guessed
 * registration number is a legal misstatement rather than an approximation, so
 * these are held to the same gate: while they are PLACEHOLDER, a production
 * build fails unless ALLOW_PLACEHOLDERS=1 is set.
 *
 * The language switcher is a stub. EN is marked as current; AR and RO are
 * rendered as disabled with a reason, not as controls that look operable and
 * silently do nothing.
 */

const REGISTRATION: FactId[] = [
  'legal-entity-name',
  'company-registration-number',
  'vat-number',
  'registered-address',
];

const CONTACT: FactId[] = ['contact-email', 'contact-phone'];

function DisclosureRow({ id }: { id: FactId }) {
  const fact = FACTS[id];
  const isPlaceholder = fact.status === 'PLACEHOLDER';

  return (
    <div className="flex flex-col gap-xs" data-fact-id={fact.id} data-fact-status={fact.status}>
      <dt className="text-label text-ink-muted uppercase">{fact.label}</dt>
      <dd className="flex flex-wrap items-center gap-sm">
        <span data-readout className="text-data text-ink">
          {fact.value}
        </span>
        {isPlaceholder ? (
          <>
            <span className="sr-only">{COPY.a11y.placeholderFact}</span>
            <span
              aria-hidden="true"
              className="border border-optic-ink px-xs text-data text-optic-ink uppercase"
            >
              placeholder
            </span>
          </>
        ) : null}
      </dd>
    </div>
  );
}

export function Footer() {
  return (
    <footer role="contentinfo" className="mt-3xl border-t border-alu/30 bg-well">
      <div className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl">
        <div className="grid gap-2xl md:grid-cols-2 lg:grid-cols-4">
          {/* Entity */}
          <section aria-labelledby="footer-registration" className="flex flex-col gap-md">
            <h2 id="footer-registration" className="text-label text-ink uppercase">
              {COPY.footer.registrationHeading}
            </h2>
            <dl className="flex flex-col gap-md">
              {REGISTRATION.map((id) => (
                <DisclosureRow key={id} id={id} />
              ))}
            </dl>
          </section>

          {/* Contact */}
          <section aria-labelledby="footer-contact" className="flex flex-col gap-md">
            <h2 id="footer-contact" className="text-label text-ink uppercase">
              {COPY.footer.contactHeading}
            </h2>
            <dl className="flex flex-col gap-md">
              {CONTACT.map((id) => (
                <DisclosureRow key={id} id={id} />
              ))}
            </dl>
          </section>

          {/* Legal */}
          <nav aria-labelledby="footer-legal" className="flex flex-col gap-md">
            <h2 id="footer-legal" className="text-label text-ink uppercase">
              {COPY.footer.legalHeading}
            </h2>
            <ul className="flex flex-col gap-sm">
              {COPY.footer.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body text-ink-muted transition-colors duration-[var(--duration-state)] ease-enter hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language switcher stub */}
          <section aria-labelledby="footer-language" className="flex flex-col gap-md">
            <h2 id="footer-language" className="text-label text-ink uppercase">
              {COPY.footer.languageHeading}
            </h2>
            <ul className="flex flex-wrap gap-sm">
              {COPY.footer.locales.map((locale) => (
                <li key={locale.code}>
                  {locale.available ? (
                    <span
                      aria-current="true"
                      className="flex min-h-11 items-center border border-action px-md text-label text-action uppercase"
                    >
                      <span className="sr-only">{COPY.a11y.currentLanguage}: </span>
                      {locale.code}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title={`${locale.label} — ${COPY.footer.localeUnavailable}`}
                      className="flex min-h-11 cursor-not-allowed items-center border border-alu/30 px-md text-label text-ink-muted uppercase opacity-50"
                    >
                      {locale.code}
                      <span className="sr-only"> — {COPY.footer.localeUnavailable}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-sm border-t border-alu/20 pt-lg text-data text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            {COPY.footer.company} — {COPY.footer.legal}
          </p>
          <p>{COPY.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
