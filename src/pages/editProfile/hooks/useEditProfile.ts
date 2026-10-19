import { useState } from 'react';

import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useMockLoading } from '@/shared/hooks/useMockLoading';

import { CURRENT_ADDRESS, PROFILE_FORM, WORK_TYPES } from '../mock';
import { editProfileSchema, type EditProfileForm } from '../schema';

const INITIAL: EditProfileForm = {
  fullName: PROFILE_FORM.fullName,
  email: PROFILE_FORM.email,
  age: PROFILE_FORM.age,
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
    phone: PROFILE_FORM.phone,
    workTypeOptions: WORK_TYPES,
    canSave: parsed.success && isDirty,
    setFullName: (v: string) => update('fullName', v),
    setEmail: (v: string) => update('email', v.trim()),
    setAge: (v: string) => update('age', v.replace(/\D/g, '').slice(0, 2)),
    setAddress: (v: string) => update('address', v),
    toggleWorkType: (id: string) =>
      update(
        'workTypes',
        form.workTypes.includes(id)
          ? form.workTypes.filter(w => w !== id)
          : [...form.workTypes, id],
      ),
    ...currentAddress,
    save: () => parsed.success && onSaved(),
  };
};
