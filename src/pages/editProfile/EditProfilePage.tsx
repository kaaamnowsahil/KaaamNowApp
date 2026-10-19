import type { FC } from 'react';

import CalendarIcon from '@/assets/icons/calendar.svg';
import MailIcon from '@/assets/icons/mail.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import { ChipGroup, IconField, PrimaryButton } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { EDIT_PROFILE_STRINGS as S } from './constants';
import { useEditProfile } from './hooks/useEditProfile';

/**
 * Profile → Edit profile. Built from Figma Edit profile (17:152 / 17:668) fields.
 * - state + validation: hooks/useEditProfile.ts, schema.ts
 * - data: mock/editProfileMock.ts
 */
export const EditProfilePage: FC<AppScreenProps<typeof ROUTES.editProfile>> = ({
  navigation,
}) => {
  const f = useEditProfile(navigation.goBack);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.TITLE}
      isLoading={f.isLoading}
      testID="edit-profile-page"
      actions={
        <PrimaryButton
          label={S.SAVE}
          disabled={!f.canSave}
          onPress={f.save}
          testID="edit-profile-save"
        />
      }
    >
      <IconField
        label={S.NAME_LABEL}
        icon={UserIcon}
        value={f.form.fullName}
        onChangeText={f.setFullName}
        autoCapitalize="words"
        testID="edit-name"
      />
      <IconField
        label={S.PHONE_LABEL}
        icon={PhoneIcon}
        prefix="+91"
        value={formatLocalPhone(f.phone)}
        editable={false}
        action={{ label: S.VERIFIED, tone: 'success' }}
        testID="edit-phone"
      />
      <IconField
        label={S.EMAIL_LABEL}
        icon={MailIcon}
        placeholder={S.EMAIL_PLACEHOLDER}
        value={f.form.email}
        onChangeText={f.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        testID="edit-email"
      />
      <IconField
        label={S.AGE_LABEL}
        icon={CalendarIcon}
        value={f.form.age}
        onChangeText={f.setAge}
        keyboardType="number-pad"
        testID="edit-age"
      />
      <IconField
        label={S.ADDRESS_LABEL}
        icon={MapPinIcon}
        value={f.form.address}
        onChangeText={f.setAddress}
        action={{
          label: f.isLocating ? S.LOCATING : S.USE_CURRENT,
          onPress: f.isLocating ? undefined : f.locate,
        }}
        testID="edit-address"
      />
      <ChipGroup
        label={S.WORK_TYPE_LABEL}
        hint={S.WORK_TYPE_HINT}
        options={f.workTypeOptions}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
      />
    </FormScreen>
  );
};
