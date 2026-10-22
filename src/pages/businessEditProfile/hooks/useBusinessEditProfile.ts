import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { initialsOf } from '@/utils/format';
import { toLocalDigits } from '@/utils/phone';

import { BUSINESS_TYPES } from '@/pages/businessSignup/mock';
import {
    createBusinessEditProfileSchema,
    type BusinessEditProfileForm,
} from '../schema';

const FALLBACK_PHONE = '+918012345678';

export const useBusinessEditProfile = (onSaved: () => void) => {
    const { t } = useTranslation();
    const schema = createBusinessEditProfileSchema(t);
    const business = useOnboardingStore(state => state.business);
    const setBusiness = useOnboardingStore(state => state.setBusiness);
    const isLoading = useMockLoading();
    const initial: BusinessEditProfileForm = {
        businessName: business?.businessName ?? 'Third Wave Coffee',
        address: business?.address ?? 'Koramangala, Bengaluru',
        businessType: business?.businessType ?? 'hospitality',
    };
    const [form, setForm] = useState<BusinessEditProfileForm>(initial);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const update = <K extends keyof BusinessEditProfileForm>(
        key: K,
        value: BusinessEditProfileForm[K],
    ) => {
        setForm(previous => ({ ...previous, [key]: value }));
        setErrors(previous => ({ ...previous, [key]: '' }));
    };
    const currentAddress = useCurrentAddress(picked =>
        update('address', picked.address),
    );
    const parsed = schema.safeParse(form);
    const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

    return {
        form,
        errors,
        isLoading,
        initials: initialsOf(form.businessName || initial.businessName),
        phone: toLocalDigits(business?.phone ?? FALLBACK_PHONE),
        businessTypeOptions: BUSINESS_TYPES,
        canSave: parsed.success && isDirty,
        setBusinessName: (value: string) => update('businessName', value),
        setAddress: (value: string) => update('address', value),
        selectBusinessType: (value: string) => update('businessType', value),
        ...currentAddress,
        changePhoto: () =>
            Alert.alert(
                t('editProfile.photoTitle'),
                t('editProfile.photoBody'),
                [{ text: t('editProfile.photoOk') }],
            ),
        save: () => {
            const result = schema.safeParse(form);
            if (!result.success) {
                const nextErrors: Record<string, string> = {};
                for (const issue of result.error.issues) {
                    const key = String(issue.path[0]);
                    nextErrors[key] ??= issue.message;
                }
                setErrors(nextErrors);
                return;
            }
            setBusiness({
                businessName: result.data.businessName,
                contactName: business?.contactName ?? '',
                phone: business?.phone ?? FALLBACK_PHONE,
                email: business?.email,
                address: result.data.address,
                location: business?.location,
                businessType: result.data.businessType,
            });
            onSaved();
        },
    };
};
