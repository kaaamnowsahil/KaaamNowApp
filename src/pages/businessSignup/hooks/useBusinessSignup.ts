import { useState } from 'react';

import { ENDPOINTS } from '@/constants/endpoints';
import { FALLBACK_BUSINESS_TYPES } from '@/constants/options';
import { useOptionList } from '@/services/catalog/useOptionList';
import {
  type GeoPoint,
  useOnboardingStore,
} from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { fieldErrors } from '@/utils/validation';

import { businessSignupSchema, type BusinessSignupForm } from '../schema';

const EMPTY: BusinessSignupForm = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  businessType: '',
};

export const useBusinessSignup = (onDone: (phoneE164: string) => void) => {
  const setBusiness = useOnboardingStore(s => s.setBusiness);
  const [form, setForm] = useState<BusinessSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const businessTypes = useOptionList(
    ENDPOINTS.businessTypes,
    FALLBACK_BUSINESS_TYPES,
  );

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
    });
    onDone(phone);
  };

  return {
    form,
    errors,
    setBusinessName: (v: string) => update('businessName', v),
    setContactName: (v: string) => update('contactName', v),
    setPhone: (v: string) => update('phone', toLocalDigits(v)),
    setEmail: (v: string) => update('email', v.trim()),
    setAddress: (v: string) => {
      update('address', v);
      setLocation(undefined);
    },
    selectBusinessType: (id: string) => update('businessType', id),
    businessTypeOptions: businessTypes.options,
    ...currentAddress,
    submit,
  };
};
