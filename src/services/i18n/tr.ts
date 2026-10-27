import i18n from './i18n';

/** Translate outside React (string modules, formatters); reads the current language on each call. */
export const tr = (key: string, values?: Record<string, unknown>): string =>
  i18n.t(key, values);

/** `record[code]` → translation of `${prefix}.${code}`, or undefined for codes without one. */
export function localizedRecord(
  prefix: string,
): Readonly<Record<string, string | undefined>> {
  return new Proxy(
    {},
    {
      get: (_, code) =>
        typeof code === 'string' && i18n.exists(`${prefix}.${code}`)
          ? i18n.t(`${prefix}.${code}`)
          : undefined,
    },
  );
}
