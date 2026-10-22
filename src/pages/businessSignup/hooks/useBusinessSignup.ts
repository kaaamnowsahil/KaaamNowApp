import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type GeoPoint,
  useOnboardingStore,
} from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { AuthApiError, loadBusinessSignupOptions } from '@/services/auth';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { fieldErrors } from '@/utils/validation';

import { createBusinessSignupSchema, type BusinessSignupForm } from '../schema';

const EMPTY: BusinessSignupForm = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  businessType: '',
  password: '',
  confirmPassword: '',
};

export const useBusinessSignup = (onDone: (phoneE164: string) => void) => {
  const { t } = useTranslation();
  const businessSignupSchema = createBusinessSignupSchema(t);
  const setBusiness = useOnboardingStore(s => s.setBusiness);
  const [form, setForm] = useState<BusinessSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessTypeOptions, setBusinessTypeOptions] = useState<
    { id: string; label: string; sortOrder: number }[]
  >([]);
  const [catalogError, setCatalogError] = useState('');
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadBusinessSignupOptions()
      .then(options => {
        if (active) setBusinessTypeOptions(options);
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
  const update = <K extends keyof BusinessSignupForm>(
    key: K,
    value: BusinessSignupForm[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const currentAddress = useCurrentAddress(picked => {
    update('address', picked.address);
    setLocation({ lat: picked.lat, lng: picked.lng });
  });

  const submit = () => {
    const parsed = businessSignupSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    const phone = toE164India(parsed.data.phone) as string;
    setBusiness({
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      phone,
      email: parsed.data.email || undefined,
      address: parsed.data.address,
      location,
      businessType: parsed.data.businessType,
      password: parsed.data.password,
    });
    onDone(phone);
  };

  return {
    form,
    errors,
    canSubmit: catalogReady && businessTypeOptions.length > 0 && businessSignupSchema.safeParse(form).success,
    catalogError,
    catalogLoading: !catalogReady,
    setBusinessName: (v: string) => update('businessName', v),
    setContactName: (v: string) => update('contactName', v),
    setPhone: (v: string) => update('phone', toLocalDigits(v)),
    setEmail: (v: string) => update('email', v.trim()),
    setPassword: (v: string) => update('password', v),
    setConfirmPassword: (v: string) => update('confirmPassword', v),
    setAddress: (v: string) => {
      update('address', v);
      setLocation(undefined);
    },
    selectBusinessType: (id: string) => update('businessType', id),
    businessTypeOptions,
    ...currentAddress,
    submit,
  };
};
