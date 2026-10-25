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
  loadBusinessSignupOptions,
} from '@/services/auth';
import { toE164India, toLocalDigits } from '@/utils/phone';
import { fieldErrors } from '@/utils/validation';

import {
  createBusinessSignupSchema,
  MAX_BUSINESS_TYPES,
  type BusinessSignupForm,
} from '../schema';

const EMPTY: BusinessSignupForm = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  businessTypes: [],
  password: '',
  confirmPassword: '',
};

export const useBusinessSignup = (
  onDone: (phoneE164: string, sent: OtpSendResponse) => void,
) => {
  const { t } = useTranslation();
  const businessSignupSchema = createBusinessSignupSchema(t);
  const setBusiness = useOnboardingStore(s => s.setBusiness);
  const [form, setForm] = useState<BusinessSignupForm>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessSignupForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
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
  const update = <K extends keyof BusinessSignupForm>(
    key: K,
    value: BusinessSignupForm[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setServerErrors(prev => ({ ...prev, [key]: '' }));
  };

  const parsedForm = businessSignupSchema.safeParse(form);
  const schemaErrors = parsedForm.success ? {} : fieldErrors(parsedForm.error);
  const errors: Record<string, string> = {};
  for (const key of Object.keys(EMPTY) as (keyof BusinessSignupForm)[]) {
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
      sent = await sendOtp(phone, 'sign_up', 'business');
    } catch (cause) {
      setBusy(false);
      setServerErrors(prev => ({
        ...prev,
        phone: cause instanceof Error ? cause.message : t('errors.generic'),
      }));
      return;
    }
    setBusiness({
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      phone,
      email: parsed.data.email || undefined,
      address: parsed.data.address,
      location,
      businessTypes: parsed.data.businessTypes,
      password: parsed.data.password,
    });
    setBusy(false);
    onDone(phone, sent);
  };

  return {
    form,
    errors,
    busy,
    canSubmit: catalogReady && businessTypeOptions.length > 0,
    touch: (key: keyof BusinessSignupForm) =>
      setTouched(prev => ({ ...prev, [key]: true })),
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
    toggleBusinessType: (id: string) => {
      setTouched(prev => ({ ...prev, businessTypes: true }));
      if (form.businessTypes.includes(id)) {
        update(
          'businessTypes',
          form.businessTypes.filter(slug => slug !== id),
        );
      } else if (form.businessTypes.length < MAX_BUSINESS_TYPES) {
        update('businessTypes', [...form.businessTypes, id]);
      }
    },
    businessTypeOptions,
    ...currentAddress,
    submit,
  };
};
