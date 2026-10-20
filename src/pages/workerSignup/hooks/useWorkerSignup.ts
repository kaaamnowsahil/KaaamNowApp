import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type GeoPoint,
  useOnboardingStore,
} from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { fieldErrors } from '@/utils/validation';

import { CURRENT_ADDRESS, WORK_TYPES } from '../mock';
import { createWorkerSignupSchema, type WorkerSignupForm } from '../schema';

const EMPTY: WorkerSignupForm = {
  fullName: '',
  phone: '',
  email: '',
  age: '',
  address: '',
  workTypes: [],
};

export const useWorkerSignup = (onDone: (phoneE164: string) => void) => {
  const { t } = useTranslation();
  const workerSignupSchema = createWorkerSignupSchema(t);
  const setWorker = useOnboardingStore(s => s.setWorker);
  const [form, setForm] = useState<WorkerSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = <K extends keyof WorkerSignupForm>(
    key: K,
    value: WorkerSignupForm[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const currentAddress = useCurrentAddress(CURRENT_ADDRESS, picked => {
    update('address', picked.address);
    setLocation({ lat: picked.lat, lng: picked.lng });
  });

  const submit = () => {
    const parsed = workerSignupSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    const phone = toE164India(parsed.data.phone) as string;
    setWorker({
      fullName: parsed.data.fullName,
      phone,
      email: parsed.data.email || undefined,
      age: Number(parsed.data.age),
      address: parsed.data.address,
      location,
      workTypes: parsed.data.workTypes,
    });
    onDone(phone);
  };

  return {
    form,
    errors,
    canSubmit: workerSignupSchema.safeParse(form).success,
    setFullName: (v: string) => update('fullName', v),
    setPhone: (v: string) => update('phone', toLocalDigits(v)),
    setEmail: (v: string) => update('email', v.trim()),
    setAge: (v: string) => update('age', v.replace(/\D/g, '').slice(0, 2)),
    setAddress: (v: string) => {
      update('address', v);
      setLocation(undefined);
    },
    toggleWorkType: (id: string) =>
      update(
        'workTypes',
        form.workTypes.includes(id)
          ? form.workTypes.filter(w => w !== id)
          : [...form.workTypes, id],
      ),
    workTypeOptions: WORK_TYPES,
    ...currentAddress,
    submit,
  };
};
