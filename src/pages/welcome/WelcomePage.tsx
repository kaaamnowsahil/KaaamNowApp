import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import KaamNowLogo from '@/assets/figma/kaamnow-logo.svg';
import { BodyNote, PrimaryButton, ScreenIntro, SecondaryButton, TextField } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { RootScreenProps } from '@/types';

import { WELCOME_STRINGS } from './constants';
import { useWelcome } from './hooks/useWelcome';

/**
 * Welcome / sign-in page orchestrator. Figma: Welcome back · Light (1:39) / Dark (1:78).
 * - state: hooks/useWelcome.ts (phone input + validation)
 * - constants: constants/welcomeStrings.ts
 */
export const WelcomePage: FC<RootScreenProps<typeof ROUTES.welcome>> = ({ navigation }) => {
  const { phone, setPhone, e164, showInvalid, flagInvalid } = useWelcome();

  const startVerification = (intent: 'signIn' | 'signUp') => {
    if (e164) {
      navigation.navigate(ROUTES.verifyPhone, { phone: e164, intent });
    } else {
      flagInvalid();
    }
  };

  return (
    <FormScreen
      testID="welcome-page"
      actions={
        <>
          <PrimaryButton
            label={WELCOME_STRINGS.SEND_CODE}
            disabled={!e164}
            onPress={() => startVerification('signIn')}
            testID="welcome-send-code"
          />
          <SecondaryButton
            label={WELCOME_STRINGS.CREATE_ACCOUNT}
            onPress={() => startVerification('signUp')}
            testID="welcome-create-account"
          />
        </>
      }
    >
      <View style={styles.logoRow}>
        <KaamNowLogo width={96} height={96} />
      </View>
      <ScreenIntro title={WELCOME_STRINGS.TITLE} subtitle={WELCOME_STRINGS.SUBTITLE} />
      <TextField
        label={WELCOME_STRINGS.PHONE_LABEL}
        helper={showInvalid ? WELCOME_STRINGS.PHONE_INVALID : WELCOME_STRINGS.PHONE_HELPER}
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
