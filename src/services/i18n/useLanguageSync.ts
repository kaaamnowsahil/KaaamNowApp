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
 * Applies the saved language to i18next.
 * The account language is read only on the first launch, before this device has a saved
 * choice. English is a real choice: a later change must not be replaced by the previous one.
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);
  const preferencesHydrated = usePreferencesStore(s => s.hasHydrated);
  const languagePersisted = usePreferencesStore(s => s.languagePersisted);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const isAuth = useAuthStore(s => s.isAuth);

  useEffect(() => {
    const target = normalizeLanguage(language.id) ?? 'en';
    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
  }, [language.id, i18n]);

  useEffect(() => {
    if (!hasHydrated || !preferencesHydrated || languagePersisted) return;

    if (!isAuth) {
      const fallback = getDeviceLanguage();
      if (fallback !== language.id) {
        setLanguage({ id: fallback, label: LANGUAGE_LABELS[fallback] });
      }
      return;
    }

    let cancelled = false;

    const syncFromProfile = async () => {
      try {
        const profile = await meApi.profile();
        if (cancelled) return;
        const apiLanguage = normalizeLanguage(profile.account.language_code);
        if (!apiLanguage || apiLanguage === language.id) return;
        setLanguage({ id: apiLanguage, label: LANGUAGE_LABELS[apiLanguage] });
      } catch {
        // Keep the local language when the profile cannot be loaded.
      }
    };

    void syncFromProfile();
    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    preferencesHydrated,
    languagePersisted,
    isAuth,
    language.id,
    setLanguage,
  ]);
};
