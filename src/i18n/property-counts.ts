import type { Locale } from './config';

type PluralCategory = ReturnType<Intl.PluralRules['select']>;

export type CountForms = Partial<Record<PluralCategory, string>> & {
  other: string;
};

export function formatPropertyCount(
  locale: Locale,
  count: number,
  forms: CountForms,
): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;

  return template.replaceAll('{count}', String(count));
}
