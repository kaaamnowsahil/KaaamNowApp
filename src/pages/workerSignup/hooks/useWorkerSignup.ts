import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type GeoPoint,
  useOnboardingStore,
} from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import {
  AuthApiError,
  checkPhoneForSignup,
  sendOtp,
  type OtpSendResponse,
  loadWorkerSignupOptions,
} from '@/services/auth';
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

export const useWorkerSignup = (
  onDone: (phoneE164: string, sent: OtpSendResponse) => void,
) => {
  const { t } = useTranslation();
  const workerSignupSchema = createWorkerSignupSchema(t);
  const setWorker = useOnboardingStore(s => s.setWorker);
  const [form, setForm] = useState<WorkerSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof WorkerSignupForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
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
          setCatalogError(
            error instanceof AuthApiError ? error.message : t('errors.generic'),
          );
        }
      })
      .finally(() => {
        if (active) setCatalogReady(true);
      });
    return () => {
      active = false;
    };
  }, [t]);
  const update = <K extends keyof WorkerSignupForm>(
    key: K,
    value: WorkerSignupForm[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setServerErrors(prev => ({ ...prev, [key]: '' }));
  };

  const parsedForm = workerSignupSchema.safeParse(form);
  const schemaErrors = parsedForm.success ? {} : fieldErrors(parsedForm.error);
  const errors: Record<string, string> = {};
  for (const key of Object.keys(EMPTY) as (keyof WorkerSignupForm)[]) {
    const message =
      serverErrors[key] || (submitted || touched[key] ? schemaErrors[key] : '');
    if (message) errors[key] = message;
  }

  const currentAddress = useCurrentAddress(picked => {
    update('address', picked.address);
    setLocation({ lat: picked.lat, lng: picked.lng });
  });

  const submit = async () => {
    setSubmitted(true);
    const parsed = parsedForm;
    if (!parsed.success || busy) {
      return;
    }
    const phone = toE164India(parsed.data.phone) as string;
    setBusy(true);
    let sent: OtpSendResponse;
    try {
      await checkPhoneForSignup(phone);
      sent = await sendOtp(phone, 'sign_up', 'worker');
    } catch (cause) {
      setBusy(false);
      setServerErrors(prev => ({
        ...prev,
        phone: cause instanceof Error ? cause.message : t('errors.generic'),
      }));
      return;
    }
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
    setBusy(false);
    onDone(phone, sent);
  };

  return {
    form,
    errors,
    busy,
    canSubmit: catalogReady && workTypeOptions.length > 0,
    touch: (key: keyof WorkerSignupForm) =>
      setTouched(prev => ({ ...prev, [key]: true })),
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
    toggleWorkType: (id: string) => {
      setTouched(prev => ({ ...prev, workTypes: true }));
      update(
        'workTypes',
        form.workTypes.includes(id)
          ? form.workTypes.filter(w => w !== id)
          : [...form.workTypes, id],
      );
    },
    workTypeOptions,
    ...currentAddress,
    submit,
  };
};
