import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { phone, setPhone, e164 } = useWelcome();
  return (
    <FormScreen
      testID="welcome-page"
      actions={
        <>
          <PrimaryButton
            label={t('welcome.sendCode')}
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
      <TextField
        label={t('welcome.phoneLabel')}
        helper={t('welcome.phoneHelper')}
        prefix={t('welcome.phonePrefix')}
        placeholder={t('welcome.phonePlaceholder')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        testID="welcome-phone-input"
      />
      <BodyNote>{t('welcome.legal')}</BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center' },
});
