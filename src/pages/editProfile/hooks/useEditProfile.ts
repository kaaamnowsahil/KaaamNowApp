import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { initialsOf } from '@/utils/format';

import { PROFILE_FORM, WORK_TYPES } from '../mock';
import { createEditProfileSchema, type EditProfileForm } from '../schema';

const INITIAL: EditProfileForm = {
  fullName: PROFILE_FORM.fullName,
  address: PROFILE_FORM.address,
  workTypes: PROFILE_FORM.workTypes,
};

export const useEditProfile = (onSaved: () => void) => {
  const { t } = useTranslation();
  const editProfileSchema = createEditProfileSchema(t);
  const isLoading = useMockLoading();
  const [form, setForm] = useState<EditProfileForm>(INITIAL);

  const update = <K extends keyof EditProfileForm>(
    key: K,
    value: EditProfileForm[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const currentAddress = useCurrentAddress(picked =>
    update('address', picked.address),
  );

  const parsed = editProfileSchema.safeParse(form);
  const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL);

  return {
    isLoading,
    form,
    initials: initialsOf(form.fullName || PROFILE_FORM.fullName),
    phone: PROFILE_FORM.phone,
    workTypeOptions: WORK_TYPES,
    canSave: parsed.success && isDirty,
    setFullName: (v: string) => update('fullName', v),
    setAddress: (v: string) => update('address', v),
    toggleWorkType: (id: string) =>
      update(
        'workTypes',
        form.workTypes.includes(id)
          ? form.workTypes.filter(w => w !== id)
          : [...form.workTypes, id],
      ),
    changePhoto: () =>
      Alert.alert(
        t('editProfile.photoTitle'),
        t('editProfile.photoBody'),
        [{ text: t('editProfile.photoOk') }],
      ),
    ...currentAddress,
    save: () => parsed.success && onSaved(),
  };
};
