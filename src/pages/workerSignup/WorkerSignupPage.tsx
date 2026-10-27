import type { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import CalendarIcon from '@/assets/icons/calendar.svg';
import MailIcon from '@/assets/icons/mail.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import {
  SelectSheetField,
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

import { useWorkerSignup } from './hooks/useWorkerSignup';

/**
 * Worker sign-up orchestrator. No dedicated Figma frame; built from the
 * Edit profile frame (17:152 / 17:668) fields and chips.
 * - state + validation: hooks/useWorkerSignup.ts, schema.ts
 * - work types + current address: backend catalog and device location
 */
export const WorkerSignupPage: FC<
  AuthScreenProps<typeof ROUTES.workerSignup>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const f = useWorkerSignup((phone, sent) =>
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
      title={t('workerSignup.title')}
      testID="worker-signup-page"
      actions={
        <PrimaryButton
          label={t('workerSignup.continue')}
          onPress={f.submit}
          disabled={!f.canSubmit || f.busy}
          testID="worker-continue"
        />
      }
    >
      <ScreenIntro subtitle={t('workerSignup.subtitle')} />
      <IconField
        label={t('workerSignup.nameLabel')}
        icon={UserIcon}
        placeholder={t('workerSignup.namePlaceholder')}
        value={f.form.fullName}
        onChangeText={f.setFullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        onBlur={() => f.touch('fullName')}
        error={f.errors.fullName}
        testID="worker-name"
      />
      <IconField
        label={t('workerSignup.phoneLabel')}
        icon={PhoneIcon}
        prefix="+91"
        placeholder={t('workerSignup.phonePlaceholder')}
        value={formatLocalPhone(f.form.phone)}
        onChangeText={f.setPhone}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        onBlur={() => f.touch('phone')}
        error={f.errors.phone}
        testID="worker-phone"
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
        testID="worker-password"
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
        testID="worker-confirm-password"
      />
      <IconField
        label={t('workerSignup.emailLabel')}
        icon={MailIcon}
        placeholder={t('workerSignup.emailPlaceholder')}
        value={f.form.email}
        onChangeText={f.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        onBlur={() => f.touch('email')}
        error={f.errors.email}
        testID="worker-email"
      />
      <IconField
        label={t('workerSignup.ageLabel')}
        icon={CalendarIcon}
        placeholder={t('workerSignup.agePlaceholder')}
        value={f.form.age}
        onChangeText={f.setAge}
        keyboardType="number-pad"
        onBlur={() => f.touch('age')}
        error={f.errors.age}
        testID="worker-age"
      />
      <IconField
        label={t('workerSignup.addressLabel')}
        icon={MapPinIcon}
        placeholder={t('workerSignup.addressPlaceholder')}
        value={f.form.address}
        onChangeText={f.setAddress}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        action={{
          label: f.isLocating
            ? t('workerSignup.locating')
            : t('workerSignup.useCurrent'),
          onPress: f.isLocating ? undefined : f.locate,
        }}
        onBlur={() => f.touch('address')}
        error={f.errors.address || f.locateError || undefined}
        testID="worker-address"
      />
      <SelectSheetField
        multiple
        label={t('workerSignup.workTypeLabel')}
        hint={
          f.catalogError ||
          (f.catalogLoading
            ? t('auth.loadingOptions')
            : t('workerSignup.workTypeHint'))
        }
        error={f.errors.workTypes}
        options={f.workTypeOptions.map(option => ({
          ...option,
          label: t(`workerSignup.workTypes.${option.id}`, {
            defaultValue: option.label,
          }),
        }))}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
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
