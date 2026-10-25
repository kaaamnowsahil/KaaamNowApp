import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { BodyNote, PrimaryButton } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { LanguageRow } from './components';
import { LANGUAGES } from './mock';

/** Profile → Language (Figma 14 · Preferences / Language). Options: mock/languageMock.ts */
export const LanguagePage: FC<AppScreenProps<typeof ROUTES.language>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);
  const [selectedId, setSelectedId] = useState(language.id);

  const apply = () => {
    const picked = LANGUAGES.find(option => option.id === selectedId);
    if (picked) {
      setLanguage({ id: picked.id, label: picked.caption });
      meApi
        .updateProfile({ language_code: picked.id })
        .catch(error =>
          Alert.alert(t('editProfile.preferenceFailed'), errorMessage(error)),
        );
    }
    navigation.goBack();
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('language.title')}
      gap={14}
      testID="language-page"
      actions={
        <PrimaryButton
          label={t('language.apply')}
          disabled={selectedId === language.id}
          onPress={apply}
          testID="language-apply"
        />
      }
    >
      <BodyNote>{t('language.subtitle')}</BodyNote>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        {LANGUAGES.map((option, index) => (
          <LanguageRow
            key={option.id}
            label={option.label}
            caption={option.caption}
            selected={option.id === selectedId}
            isLast={index === LANGUAGES.length - 1}
            onPress={() => setSelectedId(option.id)}
            testID={`language-${option.id}`}
          />
        ))}
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
});
