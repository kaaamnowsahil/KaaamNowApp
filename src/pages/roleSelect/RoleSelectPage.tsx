import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  InfoRow,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  useOnboardingStore,
  type UserRole,
} from '@/services/onboarding/useOnboardingStore';
import type { AuthScreenProps } from '@/types';

/**
 * Role select page orchestrator. Figma: How will you use KaaamNow? · Light (1:187) / Dark (1:221).
 * - state: services/onboarding/useOnboardingStore.ts (selected role)
 * - i18n: useTranslation ('roleSelect' namespace)
 */
export const RoleSelectPage: FC<AuthScreenProps<typeof ROUTES.roleSelect>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const role = useOnboardingStore(s => s.role);
  const setRole = useOnboardingStore(s => s.setRole);

  const options: {
    role: UserRole;
    title: string;
    caption: string;
  }[] = [
      {
        role: 'worker',
        title: t('roleSelect.worker'),
        caption: t('roleSelect.workerCaption', {
          defaultValue: 'Discover shifts, apply and earn.',
        }),
      },
      {
        role: 'business',
        title: t('roleSelect.business'),
        caption: t('roleSelect.businessCaption', {
          defaultValue: 'Post shifts and manage a reliable team.',
        }),
      },
    ];

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('roleSelect.title')}
      testID="role-select-page"
      actions={
        <>
          <PrimaryButton
            label={t('roleSelect.continue')}
            disabled={!role}
            onPress={() =>
              navigation.navigate(
                role === 'business'
                  ? ROUTES.businessSignup
                  : ROUTES.workerSignup,
              )
            }
            testID="role-continue"
          />
          <SecondaryButton
            label={t('common.back')}
            onPress={navigation.goBack}
            testID="role-back"
          />
        </>
      }
    >
      <ScreenIntro subtitle={t('roleSelect.subtitle')} />
      <View>
        {options.map(option => (
          <InfoRow
            key={option.role}
            title={option.title}
            caption={option.caption}
            selected={role === option.role}
            onPress={() => setRole(option.role)}
            testID={`role-option-${option.role}`}
          />
        ))}
      </View>
    </FormScreen>
  );
};
