import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware navigation.
 *
 * Import Link, redirect, usePathname and useRouter FROM HERE, never from next.
 * These wrappers carry the active locale into every href, so a link written as
 * `/for-retailers` resolves to `/ar/for-retailers` for an Arabic reader without
 * any call site knowing about locales.
 *
 * The failure mode this prevents is quiet and expensive: a bare next/link drops
 * the reader back to English mid-journey, and on a conversion path that reads
 * as the site being broken.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
