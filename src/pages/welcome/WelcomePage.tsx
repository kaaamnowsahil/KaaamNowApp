import { useState, type FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
import { loginWithPassword, AuthApiError } from '@/services/auth/authApi';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AuthScreenProps } from '@/types';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';

import { useWelcome } from './hooks/useWelcome';

/**
 * Welcome / sign-in page orchestrator. Figma: Welcome back · Light (1:39) / Dark (1:78).
 * - state: hooks/useWelcome.ts (phone input + validation)
 * - i18n: useTranslation ('welcome' namespace)
 */
export const WelcomePage: FC<AuthScreenProps<typeof ROUTES.welcome>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { phone, setPhone, e164 } = useWelcome();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signIn = useAuthStore(s => s.signIn);
  const clearSignup = useOnboardingStore(s => s.clearSignup);

  const submit = async () => {
    if (!e164 || !password || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await loginWithPassword(e164, password);
      const role =
        response.me.active_role === 'business' ||
        response.me.active_role === 'worker'
          ? response.me.active_role
          : (response.me.roles.find(
              value => value === 'business' || value === 'worker',
            ) as UserRole | undefined) ?? 'worker';
      await signIn({ phone: e164, role, tokens: response.tokens });
      clearSignup();
    } catch (cause) {
      setError(
        cause instanceof AuthApiError ? cause.message : t('auth.loginError'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen
      busy={busy}
      testID="welcome-page"
      gap={16}
      actions={
        <>
          <PrimaryButton
            label={busy ? t('auth.working') : t('welcome.signIn')}
            disabled={!e164 || !password || busy}
            onPress={submit}
            testID="welcome-sign-in"
          />
          <SecondaryButton
            label={t('welcome.createAccount')}
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
        title={t('welcome.title')}
        subtitle={t('welcome.subtitle')}
      />
      <View style={styles.fields}>
        <TextField
          label={t('welcome.phoneLabel')}
          prefix={t('welcome.phonePrefix')}
          placeholder={t('welcome.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          autoComplete="tel-national"
          textContentType="telephoneNumber"
          testID="welcome-phone-input"
        />
        <TextField
          label={t('auth.passwordLabel')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          testID="welcome-password-input"
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate(ROUTES.forgotPassword)}
          style={styles.forgotLink}
          testID="welcome-forgot-password"
        >
          <Text style={[styles.link, { color: colors.primary }]}>
            {t('auth.forgotPassword')}
          </Text>
        </Pressable>
      </View>
      {error ? (
        <BodyNote>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </BodyNote>
      ) : null}
      <BodyNote>
        <Trans
          i18nKey="welcome.legalLinked"
          components={{
            terms: (
              <Text
                accessibilityRole="link"
                onPress={() => navigation.navigate(ROUTES.terms)}
                style={[styles.inlineLink, { color: colors.primary }]}
                testID="welcome-terms"
              />
            ),
          }}
        />{' '}
        <Text
          accessibilityRole="link"
          onPress={() => navigation.navigate(ROUTES.faq)}
          style={[styles.inlineLink, { color: colors.primary }]}
          testID="welcome-faq"
        >
          {t('faq.title')}
        </Text>
      </BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center' },
  fields: { gap: 12 },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: 2 },
  link: { fontSize: 14, textDecorationLine: 'underline' },
  inlineLink: { textDecorationLine: 'underline' },
});
