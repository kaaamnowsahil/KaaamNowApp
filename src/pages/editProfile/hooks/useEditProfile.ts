import { useState } from 'react';
import { Alert } from 'react-native';

import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { initialsOf } from '@/utils/format';

import { EDIT_PROFILE_STRINGS as S } from '../constants';
import { CURRENT_ADDRESS, PROFILE_FORM, WORK_TYPES } from '../mock';
import { editProfileSchema, type EditProfileForm } from '../schema';

const INITIAL: EditProfileForm = {
  fullName: PROFILE_FORM.fullName,
  address: PROFILE_FORM.address,
  workTypes: PROFILE_FORM.workTypes,
};

export const useEditProfile = (onSaved: () => void) => {
  const isLoading = useMockLoading();
  const [form, setForm] = useState<EditProfileForm>(INITIAL);

  const update = <K extends keyof EditProfileForm>(
    key: K,
    value: EditProfileForm[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const currentAddress = useCurrentAddress(CURRENT_ADDRESS, picked =>
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
      Alert.alert(S.PHOTO_TITLE, S.PHOTO_BODY, [{ text: S.PHOTO_OK }]),
    ...currentAddress,
    save: () => parsed.success && onSaved(),
  };
};
