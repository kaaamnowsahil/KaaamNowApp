import { useEffect, useState } from 'react';

import { apiRequest, errorMessage } from '@/services/api/apiClient';
import { loadBusinessSignupOptions, loadWorkerSignupOptions } from '@/services/auth';
import type { SignupOption } from '@/services/auth/signupCatalogApi';
import { useAuthStore, type AuthTokens } from '@/services/auth/useAuthStore';
import type { GeoPoint, UserRole } from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';

import { ADD_ROLE_STRINGS as S } from '../constants/addRoleStrings';

const MIN_AGE = 18;
const MIN_ADDRESS_LENGTH = 3;

type Form = {
  name: string;
  age: string;
  businessName: string;
  address: string;
  types: string[];
};

const EMPTY: Form = { name: '', age: '', businessName: '', address: '', types: [] };

const validate = (role: UserRole, form: Form) => {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (!form.name.trim()) errors.name = S.required;
  if (role === 'worker' && !(Number(form.age) >= MIN_AGE)) errors.age = S.ageInvalid;
  if (role === 'business' && !form.businessName.trim()) errors.businessName = S.required;
  if (form.address.trim().length < MIN_ADDRESS_LENGTH) errors.address = S.addressShort;
  if (!form.types.length) errors.types = S.pickOne;
  return errors;
};

const buildBody = (role: UserRole, form: Form, location?: GeoPoint) => {
  const place = {
    address_text: form.address.trim(),
    latitude: location?.lat ?? null,
    longitude: location?.lng ?? null,
  };
  return role === 'worker'
    ? {
        role,
        worker: {
          ...place,
          full_name: form.name.trim(),
          age: Number(form.age),
          work_type_slugs: form.types,
        },
      }
    : {
        role,
        business: {
          ...place,
          business_name: form.businessName.trim(),
          contact_name: form.name.trim(),
          business_type_slugs: form.types,
        },
      };
};

/** Adds the user's other role, then signs in again with tokens that carry both roles. */
export const useAddRole = (role: UserRole, onDone: () => void) => {
  const [form, setForm] = useState<Form>(EMPTY);
  const [location, setLocation] = useState<GeoPoint | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [options, setOptions] = useState<SignupOption[]>([]);
  const [optionsError, setOptionsError] = useState('');
  const [optionsReady, setOptionsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = role === 'worker' ? loadWorkerSignupOptions : loadBusinessSignupOptions;
    load()
      .then(items => active && setOptions(items))
      .catch(error => active && setOptionsError(errorMessage(error)))
      .finally(() => active && setOptionsReady(true));
    return () => {
      active = false;
    };
  }, [role]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSubmitError('');
  };

  const currentAddress = useCurrentAddress(picked => {
    update('address', picked.address);
    setLocation({ lat: picked.lat, lng: picked.lng });
  });

  const errors = submitted ? validate(role, form) : {};

  const submit = async () => {
    setSubmitted(true);
    if (busy || Object.keys(validate(role, form)).length) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ tokens: AuthTokens }>('POST', '/me/roles', {
        body: buildBody(role, form, location),
      });
      const { phone, signIn } = useAuthStore.getState();
      await signIn({ phone: phone ?? '', role, tokens: result.tokens });
      onDone();
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return {
    form,
    errors,
    busy,
    submitError,
    options,
    optionsError,
    optionsLoading: !optionsReady,
    setName: (v: string) => update('name', v),
    setAge: (v: string) => update('age', v.replace(/\D/g, '').slice(0, 2)),
    setBusinessName: (v: string) => update('businessName', v),
    setAddress: (v: string) => {
      update('address', v);
      setLocation(undefined);
    },
    toggleType: (id: string) =>
      update(
        'types',
        form.types.includes(id) ? form.types.filter(t => t !== id) : [...form.types, id],
      ),
    ...currentAddress,
    submit,
  };
};
