import { FACTS } from '@/content/facts';
import { SITE_URL } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';

/**
 * Organization and Product JSON-LD.
 *
 * THE RULE THIS FILE ENFORCES: a property is emitted only when the fact behind
 * it is real. Structured data is a machine-readable assertion to search engines
 * and to anything that resyndicates them — a fabricated VAT number or a made-up
 * address here is a misstatement that travels further than one on a page, and
 * it is harder to retract. Every field below is dropped rather than guessed
 * when its fact is still a PLACEHOLDER.
 *
 * The consequence, until facts.ts is filled in: the emitted Organization is a
 * name, a URL and a description. That is correct. A skeleton that is true beats
 * a complete one that is not.
 *
 * No aggregateRating, no review, no offer. We have no reviews and no published
 * price, and inventing either is the most common way sites earn a manual
 * action.
 */

/** A fact's value, or undefined when it is not yet real. */
function value(id: keyof typeof FACTS): string | undefined {
  const fact = FACTS[id];
  if (!fact || fact.status === 'PLACEHOLDER') return undefined;
  const trimmed = fact.value.trim();
  return trimmed && trimmed !== '—' ? trimmed : undefined;
}

/** Strips undefined so no empty property is serialised. */
function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== null),
  ) as Partial<T>;
}

export function OrganizationSchema({ locale }: { locale: Locale }) {
  const organization = compact({
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Green Exchange',
    url: SITE_URL,
    legalName: value('legal-entity-name'),
    vatID: value('vat-number'),
    taxID: value('company-registration-number'),
    email: value('contact-email'),
    telephone: value('contact-phone'),
    address: value('registered-address')
      ? { '@type': 'PostalAddress', streetAddress: value('registered-address') }
      : undefined,
    // No sameAs: there are no verified profiles to link, and inventing one
    // is exactly the kind of claim this file exists to prevent.
    availableLanguage: routing.locales.map((code) => code),
  });

  /**
   * The machine, described as a product. Deliberately mechanism-only: what it
   * accepts and what it does. No price, no availability, no rating.
   */
  const product = compact({
    '@type': 'Product',
    '@id': `${SITE_URL}/#rvm`,
    name: 'Green Exchange reverse vending machine',
    description:
      'A reverse vending machine that accepts used PET bottles and aluminium cans, identifies and validates each container, compacts and sorts it by material stream, and returns value to the depositor.',
    category: 'Reverse vending machine',
    brand: { '@type': 'Brand', name: 'Green Exchange' },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
    material: ['PET', 'Aluminium'],
    // Every one of these is dropped while its fact is a placeholder.
    additionalProperty: (
      [
        ['Floor space required', 'floor-space-required-m2'],
        ['Machine dimensions', 'machine-dimensions'],
        ['Power requirement', 'power-requirement'],
        ['Accepted container sizes', 'accepted-container-sizes'],
        ['Containers per machine per day', 'containers-per-machine-per-day'],
      ] as const
    )
      .map(([name, id]) => {
        const propertyValue = value(id);
        return propertyValue ? { '@type': 'PropertyValue', name, value: propertyValue } : undefined;
      })
      .filter(Boolean),
  });

  // An empty additionalProperty array is noise; drop it.
  if (Array.isArray(product.additionalProperty) && product.additionalProperty.length === 0) {
    delete product.additionalProperty;
  }

  const graph = { '@context': 'https://schema.org', '@graph': [organization, product] };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output, not user input. `<` is escaped so a value can
      // never close this tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
      data-locale={locale}
    />
  );
}

export default OrganizationSchema;
