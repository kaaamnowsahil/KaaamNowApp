import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BodyNote,
  BrandLogo,
  PopIn,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
  TextField,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AuthScreenProps } from '@/types';

import { WELCOME_STRINGS } from './constants';
import { useWelcome } from './hooks/useWelcome';

/**
 * Welcome / sign-in page orchestrator. Figma: Welcome back · Light (1:39) / Dark (1:78).
 * - state: hooks/useWelcome.ts (phone input + validation)
 * - constants: constants/welcomeStrings.ts
 */
export const WelcomePage: FC<AuthScreenProps<typeof ROUTES.welcome>> = ({
  navigation,
}) => {
  const { phone, setPhone, e164 } = useWelcome();
  return (
    <FormScreen
      testID="welcome-page"
      actions={
        <>
          <PrimaryButton
            label={WELCOME_STRINGS.SEND_CODE}
            disabled={!e164}
            onPress={() =>
              e164 &&
              navigation.navigate(ROUTES.verifyPhone, {
                phone: e164,
                intent: 'signIn',
              })
            }
            testID="welcome-send-code"
          />
          <SecondaryButton
            label={WELCOME_STRINGS.CREATE_ACCOUNT}
            onPress={() => navigation.navigate(ROUTES.roleSelect)}
            testID="welcome-create-account"
          />
        </>
      }
    >
      <View style={styles.logoRow}>
        <PopIn>
          <BrandLogo size={96} />
        </PopIn>
      </View>
      <ScreenIntro
        title={WELCOME_STRINGS.TITLE}
        subtitle={WELCOME_STRINGS.SUBTITLE}
      />
      <TextField
        label={WELCOME_STRINGS.PHONE_LABEL}
        helper={WELCOME_STRINGS.PHONE_HELPER}
        prefix={WELCOME_STRINGS.PHONE_PREFIX}
        placeholder={WELCOME_STRINGS.PHONE_PLACEHOLDER}
        value={phone}
        onChangeText={setPhone}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        testID="welcome-phone-input"
      />
      <BodyNote>{WELCOME_STRINGS.LEGAL}</BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center' },
});
