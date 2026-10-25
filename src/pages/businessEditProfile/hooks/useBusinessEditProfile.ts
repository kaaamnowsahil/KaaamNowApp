import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { meApi } from '@/services/api/meApi';
import { useProfilePhoto } from '@/services/media/useProfilePhoto';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { initialsOf } from '@/utils/format';
import { toLocalDigits } from '@/utils/phone';

import {
    createBusinessEditProfileSchema,
    type BusinessEditProfileForm,
} from '../schema';

const EMPTY_FORM: BusinessEditProfileForm = {
    businessName: '',
    address: '',
    businessTypes: [],
};

export const useBusinessEditProfile = (onSaved: () => void) => {
    const { t } = useTranslation();
    const schema = createBusinessEditProfileSchema(t);
    const query = useApiQuery(
        () => Promise.all([meApi.profile(), meApi.businessTypes()]),
        [],
    );
    const business = query.data?.[0].business;
    const [initial, setInitial] = useState<BusinessEditProfileForm | null>(null);
    const [form, setForm] = useState<BusinessEditProfileForm>(EMPTY_FORM);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { busy, run } = useShiftAction();
    const photo = useProfilePhoto(business?.logo_url, profile => profile.business?.logo_url);

    useEffect(() => {
        if (!business || initial) return;
        const loaded = {
            businessName: business.business_name,
            address: business.address_text || business.locality || '',
            businessTypes: business.business_type_slugs,
        };
        setInitial(loaded);
        setForm(loaded);
    }, [business, initial]);

    const update = <K extends keyof BusinessEditProfileForm>(
        key: K,
        value: BusinessEditProfileForm[K],
    ) => {
        setForm(previous => ({ ...previous, [key]: value }));
        setErrors(previous => ({ ...previous, [key]: '' }));
    };
    const currentAddress = useCurrentAddress(picked => {
        update('address', picked.address);
        setCoords({ lat: picked.lat, lng: picked.lng });
    });
    const parsed = schema.safeParse(form);
    const isDirty = initial !== null && JSON.stringify(form) !== JSON.stringify(initial);

    return {
        form,
        errors,
        isLoading: query.isLoading,
        loadError: query.error,
        initials: initialsOf(form.businessName || business?.business_name || ''),
        phone: toLocalDigits(business?.phone ?? ''),
        businessTypeOptions: query.data?.[1] ?? [],
        canSave: parsed.success && isDirty && !busy,
        setBusinessName: (value: string) => update('businessName', value),
        setAddress: (value: string) => {
            update('address', value);
            setCoords(null);
        },
        toggleBusinessType: (id: string) =>
            update(
                'businessTypes',
                form.businessTypes.includes(id)
                    ? form.businessTypes.filter(slug => slug !== id)
                    : [...form.businessTypes, id],
            ),
        ...currentAddress,
        ...photo,
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
            run(
                () =>
                    meApi.updateProfile({
                        business_name: result.data.businessName,
                        address_text: result.data.address,
                        business_type_slugs: result.data.businessTypes,
                        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
                    }),
                onSaved,
                t('editProfile.saveFailed'),
            );
        },
    };
};
