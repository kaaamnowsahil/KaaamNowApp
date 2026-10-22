import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import BriefcaseIcon from '@/assets/icons/briefcase.svg';
import MailIcon from '@/assets/icons/mail.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import {
  ChipGroup,
  BodyNote,
  IconField,
  PrimaryButton,
  ScreenIntro,
  TextButton,
  TextField,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AuthScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { useBusinessSignup } from './hooks/useBusinessSignup';

/**
 * Business sign-up orchestrator. No dedicated Figma frame; built from the
 * Edit business profile frame (25:242 / 25:304) fields and chips.
 * - state + validation: hooks/useBusinessSignup.ts, schema.ts
 * - business types + current address: mock/businessSignupMock.ts
 */
export const BusinessSignupPage: FC<
  AuthScreenProps<typeof ROUTES.businessSignup>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const f = useBusinessSignup(phone =>
    navigation.navigate(ROUTES.verifyPhone, { phone, intent: 'signUp' }),
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="business-signup-page"
      actions={
        <PrimaryButton
          label={t('businessSignup.continue')}
          onPress={f.submit}
          disabled={!f.canSubmit}
          testID="business-continue"
        />
      }
    >
      <ScreenIntro title={t('businessSignup.title')} subtitle={t('businessSignup.subtitle')} />
      <IconField
        label={t('businessSignup.businessNameLabel')}
        icon={BriefcaseIcon}
        placeholder={t('businessSignup.businessNamePlaceholder')}
        value={f.form.businessName}
        onChangeText={f.setBusinessName}
        autoCapitalize="words"
        autoComplete="organization"
        textContentType="organizationName"
        error={f.errors.businessName}
        testID="business-name"
      />
      <IconField
        label={t('businessSignup.contactLabel')}
        icon={UserIcon}
        placeholder={t('businessSignup.contactPlaceholder')}
        value={f.form.contactName}
        onChangeText={f.setContactName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={f.errors.contactName}
        testID="business-contact"
      />
      <IconField
        label={t('businessSignup.phoneLabel')}
        icon={PhoneIcon}
        prefix="+91"
        placeholder={t('businessSignup.phonePlaceholder')}
        value={formatLocalPhone(f.form.phone)}
        onChangeText={f.setPhone}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        error={f.errors.phone}
        testID="business-phone"
      />
      <TextField
        label={t('auth.passwordLabel')}
        value={f.form.password}
        onChangeText={f.setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        helper={f.errors.password || t('auth.passwordHint')}
        testID="business-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={f.form.confirmPassword}
        onChangeText={f.setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        helper={f.errors.confirmPassword}
        testID="business-confirm-password"
      />
      <IconField
        label={t('businessSignup.emailLabel')}
        icon={MailIcon}
        placeholder={t('businessSignup.emailPlaceholder')}
        value={f.form.email}
        onChangeText={f.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={f.errors.email}
        testID="business-email"
      />
      <IconField
        label={t('businessSignup.addressLabel')}
        icon={MapPinIcon}
        placeholder={t('businessSignup.addressPlaceholder')}
        value={f.form.address}
        onChangeText={f.setAddress}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        action={{
          label: f.isLocating ? t('businessSignup.locating') : t('businessSignup.useCurrent'),
          onPress: f.isLocating ? undefined : f.locate,
        }}
        error={f.errors.address || f.locateError || undefined}
        testID="business-address"
      />
      <ChipGroup
        label={t('businessSignup.businessTypeLabel')}
        hint={f.catalogError || (f.catalogLoading ? t('auth.loadingOptions') : f.errors.businessType)}
        options={f.businessTypeOptions.map(option => ({
          ...option,
          label: t(`businessSignup.businessTypes.${option.id}`, { defaultValue: option.label }),
        }))}
        selected={f.form.businessType ? [f.form.businessType] : []}
        onToggle={f.selectBusinessType}
      />
      <BodyNote>{t('welcome.legal')}</BodyNote>
      <View style={styles.legalLinks}>
        <TextButton label={t('terms.title')} onPress={() => navigation.navigate(ROUTES.terms)} tone="primary" />
        <TextButton label={t('privacy.title')} onPress={() => navigation.navigate(ROUTES.privacy)} tone="primary" />
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 22 },
});
