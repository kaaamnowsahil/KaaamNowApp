import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { meApi } from '@/services/api/meApi';
import { useProfilePhoto } from '@/services/media/useProfilePhoto';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { initialsOf } from '@/utils/format';
import { toLocalDigits } from '@/utils/phone';

import { createEditProfileSchema, type EditProfileForm } from '../schema';

const EMPTY_FORM: EditProfileForm = {
  fullName: '',
  address: '',
  workTypes: [],
};

export const useEditProfile = (onSaved: () => void) => {
  const { t } = useTranslation();
  const editProfileSchema = createEditProfileSchema(t);
  const query = useApiQuery(
    () => Promise.all([meApi.profile(), meApi.workCategories()]),
    [],
  );
  const profile = query.data?.[0];
  const worker = profile?.worker;
  const [initial, setInitial] = useState<EditProfileForm | null>(null);
  const [form, setForm] = useState<EditProfileForm>(EMPTY_FORM);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const { busy, run } = useShiftAction();
  const photo = useProfilePhoto(
    worker?.photo_url ?? profile?.account.photo_url,
    next => next.worker?.photo_url ?? next.account.photo_url,
  );

  useEffect(() => {
    if (!worker || initial) return;
    const loaded = {
      fullName: worker.full_name,
      address: worker.address_text || worker.locality || '',
      workTypes: worker.category_slugs,
    };
    setInitial(loaded);
    setForm(loaded);
  }, [worker, initial]);

  const update = <K extends keyof EditProfileForm>(
    key: K,
    value: EditProfileForm[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const currentAddress = useCurrentAddress(picked => {
    update('address', picked.address);
    setCoords({ lat: picked.lat, lng: picked.lng });
  });

  const parsed = editProfileSchema.safeParse(form);
  const isDirty =
    initial !== null && JSON.stringify(form) !== JSON.stringify(initial);

  return {
    isLoading: query.isLoading,
    loadError: query.error,
    form,
    initials: initialsOf(form.fullName || worker?.full_name || ''),
    phone: toLocalDigits(worker?.phone ?? profile?.account.phone ?? ''),
    workTypeOptions: query.data?.[1] ?? [],
    canSave: parsed.success && isDirty && !busy,
    setFullName: (v: string) => update('fullName', v),
    setAddress: (v: string) => {
      update('address', v);
      setCoords(null);
    },
    toggleWorkType: (id: string) =>
      update(
        'workTypes',
        form.workTypes.includes(id)
          ? form.workTypes.filter(w => w !== id)
          : [...form.workTypes, id],
      ),
    ...currentAddress,
    ...photo,
    save: () => {
      if (!parsed.success) return;
      run(
        () =>
          meApi.updateProfile({
            full_name: parsed.data.fullName,
            address_text: parsed.data.address,
            category_slugs: parsed.data.workTypes,
            ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
          }),
        onSaved,
        t('editProfile.saveFailed'),
      );
    },
  };
};
