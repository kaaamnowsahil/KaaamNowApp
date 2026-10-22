import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CalendarIcon from '@/assets/icons/calendar.svg';
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

import { useWorkerSignup } from './hooks/useWorkerSignup';

/**
 * Worker sign-up orchestrator. No dedicated Figma frame; built from the
 * Edit profile frame (17:152 / 17:668) fields and chips.
 * - state + validation: hooks/useWorkerSignup.ts, schema.ts
 * - work types + current address: mock/workerSignupMock.ts
 */
export const WorkerSignupPage: FC<
  AuthScreenProps<typeof ROUTES.workerSignup>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const f = useWorkerSignup(phone =>
    navigation.navigate(ROUTES.verifyPhone, { phone, intent: 'signUp' }),
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="worker-signup-page"
      actions={
        <PrimaryButton
          label={t('workerSignup.continue')}
          onPress={f.submit}
          disabled={!f.canSubmit}
          testID="worker-continue"
        />
      }
    >
      <ScreenIntro title={t('workerSignup.title')} subtitle={t('workerSignup.subtitle')} />
      <IconField
        label={t('workerSignup.nameLabel')}
        icon={UserIcon}
        placeholder={t('workerSignup.namePlaceholder')}
        value={f.form.fullName}
        onChangeText={f.setFullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
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
        helper={f.errors.password || t('auth.passwordHint')}
        testID="worker-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={f.form.confirmPassword}
        onChangeText={f.setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        helper={f.errors.confirmPassword}
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
          label: f.isLocating ? t('workerSignup.locating') : t('workerSignup.useCurrent'),
          onPress: f.isLocating ? undefined : f.locate,
        }}
        error={f.errors.address || f.locateError || undefined}
        testID="worker-address"
      />
      <ChipGroup
        label={t('workerSignup.workTypeLabel')}
        hint={f.catalogError || (f.catalogLoading ? t('auth.loadingOptions') : f.errors.workTypes || t('workerSignup.workTypeHint'))}
        options={f.workTypeOptions.map(option => ({
          ...option,
          label: t(`workerSignup.workTypes.${option.id}`, { defaultValue: option.label }),
        }))}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
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
