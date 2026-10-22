import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type GeoPoint,
  useOnboardingStore,
} from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { AuthApiError, loadWorkerSignupOptions } from '@/services/auth';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { fieldErrors } from '@/utils/validation';

import { createWorkerSignupSchema, type WorkerSignupForm } from '../schema';

const EMPTY: WorkerSignupForm = {
  fullName: '',
  phone: '',
  email: '',
  age: '',
  address: '',
  workTypes: [],
  password: '',
  confirmPassword: '',
};

export const useWorkerSignup = (onDone: (phoneE164: string) => void) => {
  const { t } = useTranslation();
  const workerSignupSchema = createWorkerSignupSchema(t);
  const setWorker = useOnboardingStore(s => s.setWorker);
  const [form, setForm] = useState<WorkerSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workTypeOptions, setWorkTypeOptions] = useState<
    { id: string; label: string; sortOrder: number }[]
  >([]);
  const [catalogError, setCatalogError] = useState('');
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadWorkerSignupOptions()
      .then(options => {
        if (active) setWorkTypeOptions(options);
      })
      .catch(error => {
        if (active) {
          setCatalogError(error instanceof AuthApiError ? error.message : t('errors.generic'));
        }
      })
      .finally(() => {
        if (active) setCatalogReady(true);
      });
    return () => { active = false; };
  }, [t]);
  const update = <K extends keyof WorkerSignupForm>(
    key: K,
    value: WorkerSignupForm[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const currentAddress = useCurrentAddress(picked => {
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
      password: parsed.data.password,
    });
    onDone(phone);
  };

  return {
    form,
    errors,
    canSubmit: catalogReady && workTypeOptions.length > 0 && workerSignupSchema.safeParse(form).success,
    catalogError,
    catalogLoading: !catalogReady,
    setFullName: (v: string) => update('fullName', v),
    setPhone: (v: string) => update('phone', toLocalDigits(v)),
    setEmail: (v: string) => update('email', v.trim()),
    setPassword: (v: string) => update('password', v),
    setConfirmPassword: (v: string) => update('confirmPassword', v),
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
    workTypeOptions,
    ...currentAddress,
    submit,
  };
};
