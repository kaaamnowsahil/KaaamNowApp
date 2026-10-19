import type { FC } from 'react';
import { View } from 'react-native';

import {
  InfoRow,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import type { AuthScreenProps } from '@/types';

import { ROLE_OPTIONS, ROLE_SELECT_STRINGS } from './constants';

/**
 * Role select page orchestrator. Figma: How will you use KaamNow? · Light (1:187) / Dark (1:221).
 * - state: services/onboarding/useOnboardingStore.ts (selected role)
 * - constants: constants/roleSelectStrings.ts
 */
export const RoleSelectPage: FC<AuthScreenProps<typeof ROUTES.roleSelect>> = ({
  navigation,
}) => {
  const role = useOnboardingStore(s => s.role);
  const setRole = useOnboardingStore(s => s.setRole);

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="role-select-page"
      actions={
        <>
          <PrimaryButton
            label={ROLE_SELECT_STRINGS.CONTINUE}
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
            label={ROLE_SELECT_STRINGS.BACK}
            onPress={navigation.goBack}
            testID="role-back"
          />
        </>
      }
    >
      <ScreenIntro
        title={ROLE_SELECT_STRINGS.TITLE}
        subtitle={ROLE_SELECT_STRINGS.SUBTITLE}
      />
      <View>
        {ROLE_OPTIONS.map(option => (
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
