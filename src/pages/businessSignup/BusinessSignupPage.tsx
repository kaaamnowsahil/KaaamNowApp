import type { FC } from 'react';

import BriefcaseIcon from '@/assets/icons/briefcase.svg';
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

import { BUSINESS_SIGNUP_STRINGS as S } from './constants';
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
  const f = useBusinessSignup(phone =>
    navigation.navigate(ROUTES.verifyPhone, { phone, intent: 'signUp' }),
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      testID="business-signup-page"
      actions={
        <PrimaryButton
          label={S.CONTINUE}
          onPress={f.submit}
          disabled={!f.canSubmit}
          testID="business-continue"
        />
      }
    >
      <ScreenIntro title={S.TITLE} subtitle={S.SUBTITLE} />
      <IconField
        label={S.BUSINESS_NAME_LABEL}
        icon={BriefcaseIcon}
        placeholder={S.BUSINESS_NAME_PLACEHOLDER}
        value={f.form.businessName}
        onChangeText={f.setBusinessName}
        autoCapitalize="words"
        autoComplete="organization"
        textContentType="organizationName"
        error={f.errors.businessName}
        testID="business-name"
      />
      <IconField
        label={S.CONTACT_LABEL}
        icon={UserIcon}
        placeholder={S.CONTACT_PLACEHOLDER}
        value={f.form.contactName}
        onChangeText={f.setContactName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={f.errors.contactName}
        testID="business-contact"
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
        testID="business-phone"
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
        testID="business-email"
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
        testID="business-address"
      />
      <ChipGroup
        label={S.BUSINESS_TYPE_LABEL}
        hint={f.errors.businessType}
        options={f.businessTypeOptions}
        selected={f.form.businessType ? [f.form.businessType] : []}
        onToggle={f.selectBusinessType}
      />
    </FormScreen>
  );
};
