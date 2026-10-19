import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  InfoRow,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
} from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { usePreferencesStore } from '@/services/config/usePreferencesStore';
import type { AppScreenProps } from '@/types';

/** Profile → App theme (Figma 14 · Preferences / Appearance, SH-09). */
export const AppearancePage: FC<AppScreenProps<typeof ROUTES.appearance>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const isLoading = useMockLoading();
  const theme = usePreferencesStore(s => s.theme);
  const setTheme = usePreferencesStore(s => s.setTheme);
  const [selected, setSelected] = useState(theme);

  const options = [
    { id: 'light' as const, title: t('appearance.light'), caption: t('appearance.lightCaption') },
    { id: 'dark' as const, title: t('appearance.dark'), caption: t('appearance.darkCaption') },
  ];

  return (
    <FormScreen
      onBack={navigation.goBack}
      gap={20}
      isLoading={isLoading}
      testID="appearance-page"
      actions={
        <>
          <PrimaryButton
            label={t('appearance.save')}
            disabled={selected === theme}
            onPress={() => {
              setTheme(selected);
              navigation.goBack();
            }}
            testID="appearance-save"
          />
          <SecondaryButton
            label={t('appearance.cancel')}
            onPress={navigation.goBack}
            testID="appearance-cancel"
          />
        </>
      }
    >
      <ScreenIntro title={t('appearance.title')} subtitle={t('appearance.subtitle')} />
      <View>
        {options.map(option => (
          <InfoRow
            key={option.id}
            title={option.title}
            caption={option.caption}
            selected={option.id === selected}
            onPress={() => setSelected(option.id)}
            testID={`appearance-${option.id}`}
          />
        ))}
      </View>
    </FormScreen>
  );
};
