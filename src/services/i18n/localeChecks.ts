export type LocaleTree = { [key: string]: string | LocaleTree };

/** Sample inputs and brand names that read the same in every language. */
export const SAME_IN_EVERY_LANGUAGE: ReadonlySet<string> = new Set([
  'KaaamNow',
  'Paytm',
  'Google Pay',
  'Apple Pay',
  'UPI',
  'UPI ID',
  'GPS: {{latitude}}, {{longitude}}',
  'you@example.com',
  'manager@business.com',
  'yourname@bank',
  'HDFC0001234',
]);

/** `{a: {b: 'x'}}` → `{'a.b': 'x'}`. */
export function flatten(tree: LocaleTree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g;

export function placeholders(text: string): string[] {
  return [
    ...new Set([...text.matchAll(PLACEHOLDER)].map(m => m[1] as string)),
  ].sort();
}

/** Text a reader would still see in English once placeholders are removed. */
function englishWords(text: string): string {
  return text
    .replace(PLACEHOLDER, '')
    .replace(/[^A-Za-z]+/g, ' ')
    .trim();
}

export type LocaleReport = {
  missing: string[];
  extra: string[];
  placeholderMismatch: string[];
  untranslated: string[];
};

/**
 * Compares a locale with English. `sameAsEnglish` lists values that are legitimately identical in
 * every language (brand names, codes); anything else equal to English counts as untranslated.
 */
export function checkLocale(
  english: LocaleTree,
  target: LocaleTree,
  sameAsEnglish: ReadonlySet<string> = new Set(),
): LocaleReport {
  const base = flatten(english);
  const other = flatten(target);
  const report: LocaleReport = {
    missing: [],
    extra: [],
    placeholderMismatch: [],
    untranslated: [],
  };
  for (const [key, text] of Object.entries(base)) {
    const translated = other[key];
    if (translated === undefined) {
      report.missing.push(key);
      continue;
    }
    if (placeholders(text).join() !== placeholders(translated).join()) {
      report.placeholderMismatch.push(key);
    }
    if (translated === text && englishWords(text) && !sameAsEnglish.has(text)) {
      report.untranslated.push(key);
    }
  }
  report.extra = Object.keys(other).filter(key => !(key in base));
  return report;
}
