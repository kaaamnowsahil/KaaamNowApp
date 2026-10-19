import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  BodyNote,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
  TextField,
} from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AuthScreenProps } from '@/types';
import { formatMmSs, maskIndianPhone } from '@/utils/format';

import { OTP_LENGTH, VERIFY_PHONE_STRINGS } from './constants';
import { useVerifyPhone } from './hooks/useVerifyPhone';

/**
 * Verify phone page orchestrator. Figma: Verify your phone · Light (1:120) / Dark (1:152).
 * - state: hooks/useVerifyPhone.ts (code input, expiry + resend countdowns)
 * - constants: constants/verifyPhoneStrings.ts
 */
export const VerifyPhonePage: FC<
  AuthScreenProps<typeof ROUTES.verifyPhone>
> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { code, setCode, expiresIn, resendIn, onResend, onVerify, canSubmit } =
    useVerifyPhone(route.params.phone);

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="verify-phone-page"
      actions={
        <>
          <PrimaryButton
            label={VERIFY_PHONE_STRINGS.VERIFY}
            disabled={!canSubmit}
            onPress={onVerify}
            testID="verify-submit"
          />
          <SecondaryButton
            label={VERIFY_PHONE_STRINGS.CHANGE_PHONE}
            onPress={navigation.goBack}
            testID="verify-change-phone"
          />
        </>
      }
    >
      <ScreenIntro
        title={VERIFY_PHONE_STRINGS.TITLE}
        subtitle={VERIFY_PHONE_STRINGS.subtitle(
          maskIndianPhone(route.params.phone),
        )}
      />
      <TextField
        label={VERIFY_PHONE_STRINGS.CODE_LABEL}
        helper={
          expiresIn > 0
            ? VERIFY_PHONE_STRINGS.codeExpiresIn(formatMmSs(expiresIn))
            : VERIFY_PHONE_STRINGS.CODE_EXPIRED
        }
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        autoFocus
        style={styles.codeInput}
        testID="verify-code-input"
      />
      <BodyNote>
        {resendIn > 0 ? (
          VERIFY_PHONE_STRINGS.resendIn(formatMmSs(resendIn))
        ) : (
          <Text
            accessibilityRole="button"
            onPress={onResend}
            style={[styles.resend, { color: colors.primary }]}
            testID="verify-resend"
          >
            {VERIFY_PHONE_STRINGS.RESEND_NOW}
          </Text>
        )}{' '}
        {VERIFY_PHONE_STRINGS.NEVER_SHARE}
      </BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  // Figma renders the code as "2   8   4   6   1   9".
  codeInput: { letterSpacing: 12 },
  resend: { textDecorationLine: 'underline' },
});
