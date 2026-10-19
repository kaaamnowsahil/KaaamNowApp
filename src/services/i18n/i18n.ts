import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import bn from './locales/bn.json';
import en from './locales/en.json';
import gu from './locales/gu.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import or from './locales/or.json';
import pa from './locales/pa.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import ur from './locales/ur.json';

export const SUPPORTED_LANGUAGES = [
  'en',
  'hi',
  'ta',
  'te',
  'kn',
  'ml',
  'mr',
  'bn',
  'gu',
  'pa',
  'or',
  'ur',
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',           // default language
  fallbackLng: 'en',   // fallback if key missing in selected language
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  compatibilityJSON: 'v4',
});

export default i18n;
