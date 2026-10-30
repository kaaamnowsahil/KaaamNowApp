import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { meApi } from '@/services/api/meApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './i18n';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  or: 'ଓଡ଼ିଆ',
  ur: 'اردو',
};

const normalizeLanguage = (value?: string | null): SupportedLanguage | null => {
  const code = value?.trim().toLowerCase().replace('_', '-') ?? '';
  if (!code) return null;

  const direct = SUPPORTED_LANGUAGES.find(lang => lang === code || code.startsWith(`${lang}-`));
  if (direct) return direct;

  const short = code.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(short) ? short : null;
};

const getDeviceLanguage = (): SupportedLanguage => {
  const nav = globalThis as typeof globalThis & {
    navigator?: { language?: string; languages?: string[] };
  };
  const candidates = [
    nav.navigator?.language,
    nav.navigator?.languages?.[0],
    Intl.DateTimeFormat().resolvedOptions().locale,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeLanguage(candidate);
    if (normalized) return normalized;
  }

  return 'en';
};

/**
 * Syncs the persisted language preference from the store into i18next.
 * On first app open, we also hydrate from the user's saved API language so the app
 * matches the last selected language even before the user opens settings.
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const isAuth = useAuthStore(s => s.isAuth);

  useEffect(() => {
    const rootLang = normalizeLanguage(language.id) ?? 'en';
    const target = rootLang;

    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
  }, [language.id, i18n]);

  useEffect(() => {
    if (!hasHydrated) return;

    const localLanguage = normalizeLanguage(language.id) ?? 'en';
    const isDefaultLanguage = localLanguage === 'en';

    if (!isAuth) {
      if (isDefaultLanguage) {
        const fallback = getDeviceLanguage();
        if (fallback !== 'en') {
          setLanguage({ id: fallback, label: LANGUAGE_LABELS[fallback] });
        }
      }
      return;
    }

    let cancelled = false;

    const syncFromProfile = async () => {
      try {
        const profile = await meApi.profile();
        if (cancelled) return;

        const apiLanguage = normalizeLanguage(profile.account.language_code);
        if (!apiLanguage) return;

        const currentLanguage = normalizeLanguage(language.id) ?? 'en';
        if (currentLanguage !== 'en') return;

        setLanguage({ id: apiLanguage, label: LANGUAGE_LABELS[apiLanguage] });
        if (i18n.language !== apiLanguage) {
          i18n.changeLanguage(apiLanguage);
        }

        await meApi.updateProfile({ language_code: apiLanguage }).catch(() => undefined);
      } catch {
        // Ignore profile sync issues; local preference remains the source of truth.
      }
    };

    if (isDefaultLanguage) {
      void syncFromProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuth, i18n, language.id, setLanguage]);
};
