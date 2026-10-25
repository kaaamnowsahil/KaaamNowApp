import type { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

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
  TextField,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AuthScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { useBusinessSignup } from './hooks/useBusinessSignup';

const SIGNUP_CHIPS_COLLAPSED = 6;

/**
 * Business sign-up orchestrator. No dedicated Figma frame; built from the
 * Edit business profile frame (25:242 / 25:304) fields and chips.
 * - state + validation: hooks/useBusinessSignup.ts, schema.ts
 * - business types + current address: backend catalog and device location
 */
export const BusinessSignupPage: FC<
  AuthScreenProps<typeof ROUTES.businessSignup>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const f = useBusinessSignup((phone, sent) =>
    navigation.navigate(ROUTES.verifyPhone, {
      phone,
      intent: 'signUp',
      expiresInSeconds: sent.expires_in_seconds,
      resendAfterSeconds: sent.resend_after_seconds,
      deliveryChannel: sent.delivery_channel,
      senderName: sent.sender_name,
    }),
  );

  return (
    <FormScreen
      busy={f.busy}
      onBack={navigation.goBack}
      testID="business-signup-page"
      actions={
        <PrimaryButton
          label={t('businessSignup.continue')}
          onPress={f.submit}
          disabled={!f.canSubmit || f.busy}
          testID="business-continue"
        />
      }
    >
      <ScreenIntro
        title={t('businessSignup.title')}
        subtitle={t('businessSignup.subtitle')}
      />
      <IconField
        label={t('businessSignup.businessNameLabel')}
        icon={BriefcaseIcon}
        placeholder={t('businessSignup.businessNamePlaceholder')}
        value={f.form.businessName}
        onChangeText={f.setBusinessName}
        autoCapitalize="words"
        autoComplete="organization"
        textContentType="organizationName"
        onBlur={() => f.touch('businessName')}
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
        onBlur={() => f.touch('contactName')}
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
        onBlur={() => f.touch('phone')}
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
        placeholder={t('auth.newPasswordPlaceholder')}
        onBlur={() => f.touch('password')}
        helper={t('auth.passwordHint')}
        error={f.errors.password}
        testID="business-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={f.form.confirmPassword}
        onChangeText={f.setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={t('auth.confirmPasswordPlaceholder')}
        onBlur={() => f.touch('confirmPassword')}
        error={f.errors.confirmPassword}
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
        onBlur={() => f.touch('email')}
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
          label: f.isLocating
            ? t('businessSignup.locating')
            : t('businessSignup.useCurrent'),
          onPress: f.isLocating ? undefined : f.locate,
        }}
        onBlur={() => f.touch('address')}
        error={f.errors.address || f.locateError || undefined}
        testID="business-address"
      />
      <ChipGroup
        label={t('businessSignup.businessTypeLabel')}
        hint={
          f.catalogError ||
          (f.catalogLoading
            ? t('auth.loadingOptions')
            : t('businessSignup.businessTypeHint'))
        }
        error={f.errors.businessTypes}
        collapsedCount={SIGNUP_CHIPS_COLLAPSED}
        options={f.businessTypeOptions.map(option => ({
          ...option,
          label: t(`businessSignup.businessTypes.${option.id}`, {
            defaultValue: option.label,
          }),
        }))}
        selected={f.form.businessTypes}
        onToggle={f.toggleBusinessType}
      />
      <BodyNote>
        <Trans
          i18nKey="welcome.legalLinked"
          components={{
            terms: (
              <Text
                accessibilityRole="link"
                onPress={() => navigation.navigate(ROUTES.terms)}
                style={[styles.inlineLink, { color: colors.primary }]}
              />
            ),
          }}
        />{' '}
        <Text
          accessibilityRole="link"
          onPress={() => navigation.navigate(ROUTES.faq)}
          style={[styles.inlineLink, { color: colors.primary }]}
        >
          {t('faq.title')}
        </Text>
      </BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  inlineLink: { textDecorationLine: 'underline' },
});
