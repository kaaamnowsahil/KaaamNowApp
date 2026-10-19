import type { FC } from 'react';
import { View } from 'react-native';

import { BodyNote, InfoRow } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import type { AppScreenProps } from '@/types';

import { LANGUAGE_STRINGS as S } from './constants';
import { LANGUAGES } from './mock';

/** Profile → Language. Uses the Role-select radio rows. Options: mock/languageMock.ts */
export const LanguagePage: FC<AppScreenProps<typeof ROUTES.language>> = ({
  navigation,
}) => {
  const isLoading = useMockLoading();
  const language = usePreferencesStore(s => s.language);
  const setLanguage = usePreferencesStore(s => s.setLanguage);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.TITLE}
      gap={12}
      isLoading={isLoading}
      testID="language-page"
    >
      <BodyNote>{S.SUBTITLE}</BodyNote>
      <View>
        {LANGUAGES.map(option => (
          <InfoRow
            key={option.id}
            title={option.label}
            caption={option.caption}
            selected={option.id === language.id}
            onPress={() => {
              setLanguage({ id: option.id, label: option.caption });
              navigation.goBack();
            }}
            testID={`language-${option.id}`}
          />
        ))}
      </View>
    </FormScreen>
  );
};
