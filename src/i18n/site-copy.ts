import { defaultLocale, type Locale } from './config';
import siteCopyDe from './locales/de/site-copy.json';

/**
 * Localized *presentation* of the shared site facts in `src/data/siteCopy.json`.
 *
 * `siteCopy.json` stays the single factual source for check-in and check-out
 * times, the pet and Wi-Fi rules, quiet hours, the cancellation reference and
 * the access note. This module owns nothing factual: it only says how one locale
 * renders a value the factual source stores in English, keyed by that value's
 * stable key.
 *
 * Rules, identical to `src/i18n/inventory-display.ts`:
 * - The default locale always renders the factual source verbatim, so English
 *   output can never drift.
 * - Any other locale renders its mapped presentation, or falls back to the
 *   factual value when nothing is mapped.
 * - A mapping must preserve factual meaning. `tests/i18n-german-visible-language.test.mjs`
 *   asserts that every number in a German mapping also appears in the English
 *   value it presents.
 * - This is not a second copy deck. Adding a key here without adding it to
 *   `siteCopy.json` does nothing.
 */
type SiteCopyPresentation = Record<string, string>;

const presentation: Partial<Record<Locale, SiteCopyPresentation>> = {
  de: siteCopyDe as SiteCopyPresentation,
};

/** Shared site fact as the locale renders it. */
export function siteText(locale: Locale, key: string, factual: string): string {
  if (locale === defaultLocale) {
    return factual;
  }

  return presentation[locale]?.[key] ?? factual;
}
