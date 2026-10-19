import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './i18n';

/**
 * Syncs the persisted language preference from the store into i18next.
 * Mount this once near the app root (inside I18nextProvider).
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const language = usePreferencesStore(s => s.language);

  useEffect(() => {
    const langCode = language.id as SupportedLanguage;
    const supported = SUPPORTED_LANGUAGES.includes(langCode);
    const target = supported ? langCode : 'en';

    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
  }, [language.id, i18n]);
};
