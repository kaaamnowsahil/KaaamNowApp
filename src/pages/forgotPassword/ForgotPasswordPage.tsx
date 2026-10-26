import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BodyNote,
  PrimaryButton,
  ScreenIntro,
  TextField,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  resetPassword,
  sendPasswordResetOtp,
  type OtpSendResponse,
} from '@/services/auth/authApi';
import { otpDeliveryNotice } from '@/services/auth/otpDeliveryNotice';
import { useTheme } from '@/theme/ThemeProvider';
import type { AuthScreenProps } from '@/types';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { OTP_LENGTH } from '@/pages/verifyPhone/constants';

export const ForgotPasswordPage: FC<
  AuthScreenProps<typeof ROUTES.forgotPassword>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [delivery, setDelivery] = useState<OtpSendResponse | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const e164 = toE164India(phone);
  const resendIn = resendAt
    ? Math.max(0, Math.ceil((resendAt - now) / 1000))
    : 0;

  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  const onRequestCode = async () => {
    if (!e164 || busy || resendIn > 0) return;
    setBusy(true);
    setError('');
    try {
      setDelivery(await sendPasswordResetOtp(e164));
      setResendAt(Date.now() + 30 * 1000);
      setNow(Date.now());
      setRequested(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('auth.resetRequestError'),
      );
    } finally {
      setBusy(false);
    }
  };

  const onResetPassword = async () => {
    if (!e164 || busy || !requested) return;
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password)) {
      setError(t('auth.passwordHint'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await resetPassword(e164, code, password);
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('auth.resetError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen
      busy={busy}
      onBack={navigation.goBack}
      title={t(complete ? 'auth.resetComplete' : 'auth.forgotPassword')}
      testID="forgot-password-page"
      actions={
        complete ? undefined : (
          <PrimaryButton
            label={
              busy
                ? t('auth.working')
                : requested
                ? t('auth.resetPassword')
                : t('auth.sendResetCode')
            }
            disabled={
              busy ||
              !e164 ||
              (requested &&
                (code.length !== OTP_LENGTH || !password || !confirmPassword))
            }
            onPress={requested ? onResetPassword : onRequestCode}
            testID="forgot-password-submit"
          />
        )
      }
    >
      <ScreenIntro
        subtitle={t(complete ? 'auth.resetSuccess' : 'auth.forgotSubtitle')}
      />
      {complete ? null : (
        <View style={styles.fields}>
          <TextField
            label={t('welcome.phoneLabel')}
            prefix={t('welcome.phonePrefix')}
            placeholder={t('welcome.phonePlaceholder')}
            value={phone}
            onChangeText={value => {
              const next = toLocalDigits(value);
              if (next !== phone) {
                setRequested(false);
                setCode('');
                setResendAt(null);
              }
              setPhone(next);
            }}
            keyboardType="number-pad"
            maxLength={10}
            autoComplete="tel-national"
            textContentType="telephoneNumber"
            testID="forgot-password-phone"
          />
          {requested ? (
            <>
              <TextField
                label={t('verifyPhone.codeLabel')}
                value={code}
                onChangeText={value =>
                  setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH))
                }
                keyboardType="number-pad"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                testID="forgot-password-code"
              />
              <TextField
                label={t('auth.newPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                helper={t('auth.passwordHint')}
                testID="forgot-password-new-password"
              />
              <TextField
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                testID="forgot-password-confirm-password"
              />
              <BodyNote>
                {[t('auth.resetRequestNotice'), otpDeliveryNotice(t, delivery)]
                  .filter(Boolean)
                  .join(' ')}
              </BodyNote>
            </>
          ) : null}
          {error ? (
            <BodyNote>
              <Text style={{ color: colors.danger }}>{error}</Text>
            </BodyNote>
          ) : null}
          {requested ? (
            <Pressable
              disabled={busy || resendIn > 0}
              onPress={onRequestCode}
              testID="forgot-password-resend"
            >
              <Text
                style={[
                  styles.link,
                  { color: colors.primary },
                  (busy || resendIn > 0) && styles.disabled,
                ]}
              >
                {resendIn > 0
                  ? t('verifyPhone.resendIn', { time: `${resendIn}s` })
                  : t('auth.resendResetCode')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  fields: { gap: 12 },
  link: { fontSize: 14, textDecorationLine: 'underline' },
  disabled: { opacity: 0.5 },
});
