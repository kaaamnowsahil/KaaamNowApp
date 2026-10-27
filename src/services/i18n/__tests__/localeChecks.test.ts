import { resources } from '../i18n';
import {
  checkLocale,
  flatten,
  placeholders,
  SAME_IN_EVERY_LANGUAGE,
  type LocaleTree,
} from '../localeChecks';

describe('localeChecks', () => {
  it('flattens nested keys', () => {
    expect(flatten({ a: { b: 'x', c: { d: 'y' } }, e: 'z' })).toEqual({
      'a.b': 'x',
      'a.c.d': 'y',
      e: 'z',
    });
  });

  it('lists distinct placeholders in order', () => {
    expect(placeholders('{{b}} and {{ a }} and {{b}}')).toEqual(['a', 'b']);
    expect(placeholders('none')).toEqual([]);
  });

  it('treats every value equal to English as untranslated by default', () => {
    expect(
      checkLocale({ a: 'Hi', b: '₹ 5' }, { a: 'Hi', b: '₹ 5' }).untranslated,
    ).toEqual(['a']);
  });

  it('reports missing, extra, placeholder and untranslated keys', () => {
    const english = {
      greet: 'Hello {{name}}',
      bye: 'Bye',
      brand: 'KaaamNow',
      sym: '₹ {{amount}}',
      gone: 'x',
    };
    const target = {
      greet: 'नमस्ते {{user}}',
      bye: 'Bye',
      brand: 'KaaamNow',
      sym: '₹ {{amount}}',
      more: 'y',
    };
    expect(checkLocale(english, target, new Set(['KaaamNow']))).toEqual({
      missing: ['gone'],
      extra: ['more'],
      placeholderMismatch: ['greet'],
      untranslated: ['bye'],
    });
  });
});

const english = resources.en.translation as unknown as LocaleTree;
const languages = Object.keys(resources).filter(language => language !== 'en');

describe.each(languages)('%s locale', language => {
  const report = checkLocale(
    english,
    resources[language as keyof typeof resources]
      .translation as unknown as LocaleTree,
    SAME_IN_EVERY_LANGUAGE,
  );

  it('has every English key and no stale keys', () => {
    expect(report.missing).toEqual([]);
    expect(report.extra).toEqual([]);
  });

  it('keeps the same placeholders as English', () => {
    expect(report.placeholderMismatch).toEqual([]);
  });

  it('has no text left in English', () => {
    expect(report.untranslated).toEqual([]);
  });
});
