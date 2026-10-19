import type { FC } from 'react';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import { ChipGroup, IconField, PrimaryButton } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { AvatarPicker } from './components';
import { EDIT_PROFILE_STRINGS as S } from './constants';
import { useEditProfile } from './hooks/useEditProfile';

/**
 * Profile → Edit profile (Figma 13 · Account / Edit profile).
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
      backVariant="plain"
      title={S.TITLE}
      gap={16}
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
      <AvatarPicker
        initials={f.initials}
        actionLabel={S.CHANGE_PHOTO}
        accessibilityLabel={S.CHANGE_PHOTO_A11Y}
        onPress={f.changePhoto}
      />
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
        prefix={S.PHONE_PREFIX}
        value={formatLocalPhone(f.phone)}
        editable={false}
        action={{ label: S.VERIFIED, tone: 'success' }}
        testID="edit-phone"
      />
      <IconField
        label={S.LOCATION_LABEL}
        icon={MapPinIcon}
        value={f.form.address}
        onChangeText={f.setAddress}
        action={{
          label: f.isLocating ? S.LOCATING : S.CHANGE,
          onPress: f.isLocating ? undefined : f.locate,
        }}
        testID="edit-address"
      />
      <ChipGroup
        label={S.WORK_TYPE_LABEL}
        options={f.workTypeOptions}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
      />
    </FormScreen>
  );
};
