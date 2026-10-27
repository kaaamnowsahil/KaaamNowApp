import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import UserIcon from '@/assets/figma/user.svg';
import { SelectSheetField, IconField, PrimaryButton } from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { AvatarPicker } from './components';
import { useEditProfile } from './hooks/useEditProfile';

/**
 * Profile → Edit profile (Figma 13 · Account / Edit profile).
 * - state + validation: hooks/useEditProfile.ts, schema.ts
 */
export const EditProfilePage: FC<AppScreenProps<typeof ROUTES.editProfile>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const f = useEditProfile(navigation.goBack);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('editProfile.title')}
      gap={16}
      isLoading={f.isLoading}
      testID="edit-profile-page"
      actions={
        <PrimaryButton
          label={t('editProfile.save')}
          disabled={!f.canSave}
          onPress={f.save}
          testID="edit-profile-save"
        />
      }
    >
      <AvatarPicker
        initials={f.initials}
        imageUri={f.photoUri}
        isUploading={f.isUploading}
        actionLabel={t('editProfile.changePhoto')}
        accessibilityLabel={t('editProfile.changePhotoA11y')}
        onPress={f.changePhoto}
      />
      <IconField
        label={t('editProfile.nameLabel')}
        icon={UserIcon}
        value={f.form.fullName}
        onChangeText={f.setFullName}
        autoCapitalize="words"
        testID="edit-name"
      />
      <IconField
        label={t('editProfile.phoneLabel')}
        icon={PhoneIcon}
        prefix={t('editProfile.phonePrefix')}
        value={formatLocalPhone(f.phone)}
        editable={false}
        action={{ label: t('editProfile.verified'), tone: 'success' }}
        testID="edit-phone"
      />
      <IconField
        label={t('editProfile.locationLabel')}
        icon={MapPinIcon}
        value={f.form.address}
        onChangeText={f.setAddress}
        action={{
          label: f.isLocating ? t('editProfile.locating') : t('editProfile.change'),
          onPress: f.isLocating ? undefined : f.locate,
        }}
        testID="edit-address"
      />
      <SelectSheetField
        multiple
        label={t('editProfile.workTypeLabel')}
        hint={f.loadError || undefined}
        options={f.workTypeOptions}
        selected={f.form.workTypes}
        onToggle={f.toggleWorkType}
      />
    </FormScreen>
  );
};
