import type { FC } from 'react';

import CalendarIcon from '@/assets/icons/calendar.svg';
import MailIcon from '@/assets/icons/mail.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import {
  ChipGroup,
  IconField,
  PrimaryButton,
  ScreenIntro,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AuthScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { WORKER_SIGNUP_STRINGS as S } from './constants';
import { useWorkerSignup } from './hooks/useWorkerSignup';

/**
 * Worker sign-up orchestrator. No dedicated Figma frame; built from the
 * Edit profile frame (17:152 / 17:668) fields and chips.
 * - state + validation: hooks/useWorkerSignup.ts, schema.ts
 * - work types: backend list with local fallback (constants/options.ts)
 */
export const WorkerSignupPage: FC<
  AuthScreenProps<typeof ROUTES.workerSignup>
> = ({ navigation }) => {
  const f = useWorkerSignup(phone =>
    navigation.navigate(ROUTES.verifyPhone, { phone, intent: 'signUp' }),
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="worker-signup-page"
      actions={
        <PrimaryButton
          label={S.CONTINUE}
          onPress={f.submit}
          testID="worker-continue"
        />
      }
    >
      <ScreenIntro title={S.TITLE} subtitle={S.SUBTITLE} />
      <IconField
        label={S.NAME_LABEL}
        icon={UserIcon}
        placeholder={S.NAME_PLACEHOLDER}
        value={f.form.fullName}
        onChangeText={f.setFullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={f.errors.fullName}
        testID="worker-name"
      />
      <IconField
        label={S.PHONE_LABEL}
        icon={PhoneIcon}
        prefix="+91"
        placeholder={S.PHONE_PLACEHOLDER}
        value={formatLocalPhone(f.form.phone)}
        onChangeText={f.setPhone}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        error={f.errors.phone}
        testID="worker-phone"
      />
      <IconField
        label={S.EMAIL_LABEL}
        icon={MailIcon}
        placeholder={S.EMAIL_PLACEHOLDER}
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
        label={S.AGE_LABEL}
        icon={CalendarIcon}
        placeholder={S.AGE_PLACEHOLDER}
        value={f.form.age}
        onChangeText={f.setAge}
        keyboardType="number-pad"
        error={f.errors.age}
        testID="worker-age"
      />
      <IconField
        label={S.ADDRESS_LABEL}
        icon={MapPinIcon}
        placeholder={S.ADDRESS_PLACEHOLDER}
        value={f.form.address}
        onChangeText={f.setAddress}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        action={{
          label: f.isLocating ? S.LOCATING : S.USE_CURRENT,
          onPress: f.isLocating ? undefined : f.locate,
        }}
        error={f.errors.address || f.locateError || undefined}
        testID="worker-address"
      />
      <ChipGroup
        label={S.WORK_TYPE_LABEL}
        hint={f.errors.workTypes || S.WORK_TYPE_HINT}
        options={f.workTypeOptions}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
      />
    </FormScreen>
  );
};
