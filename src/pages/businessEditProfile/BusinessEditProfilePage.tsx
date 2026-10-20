import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BriefcaseIcon from '@/assets/icons/briefcase.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import { ChipGroup, IconField, PrimaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';
import { formatLocalPhone } from '@/utils/phone';

import { AvatarPicker } from '@/pages/editProfile/components';
import { useBusinessEditProfile } from './hooks';

export const BusinessEditProfilePage: FC<
    AppScreenProps<typeof ROUTES.businessEditProfile>
> = ({ navigation }) => {
    const { t } = useTranslation();
    const form = useBusinessEditProfile(navigation.goBack);

    return (
        <FormScreen
            onBack={navigation.goBack}
            backVariant="plain"
            title={t('businessProfile.editBusinessProfile')}
            gap={16}
            isLoading={form.isLoading}
            testID="business-edit-profile-page"
            actions={
                <PrimaryButton
                    label={t('editProfile.save')}
                    disabled={!form.canSave}
                    onPress={form.save}
                    testID="business-edit-profile-save"
                />
            }
        >
            <AvatarPicker
                initials={form.initials}
                actionLabel={t('editProfile.changePhoto')}
                accessibilityLabel={t('editProfile.changePhotoA11y')}
                onPress={form.changePhoto}
            />
            <IconField
                label={t('businessSignup.businessNameLabel')}
                icon={BriefcaseIcon}
                value={form.form.businessName}
                onChangeText={form.setBusinessName}
                autoCapitalize="words"
                error={form.errors.businessName}
                testID="business-edit-name"
            />
            <IconField
                label={t('businessSignup.phoneLabel')}
                icon={PhoneIcon}
                prefix="+91"
                value={formatLocalPhone(form.phone)}
                editable={false}
                action={{ label: t('businessSignup.verified'), tone: 'success' }}
                testID="business-edit-phone"
            />
            <IconField
                label={t('businessSignup.addressLabel')}
                icon={MapPinIcon}
                value={form.form.address}
                onChangeText={form.setAddress}
                action={{
                    label: form.isLocating
                        ? t('businessSignup.locating')
                        : t('businessSignup.useCurrent'),
                    onPress: form.isLocating ? undefined : form.locate,
                }}
                error={form.errors.address || form.locateError || undefined}
                testID="business-edit-address"
            />
            <ChipGroup
                label={t('businessSignup.businessTypeLabel')}
                hint={form.errors.businessType}
                options={form.businessTypeOptions.map(option => ({
                    ...option,
                    label: t(`businessSignup.businessTypes.${option.id}`),
                }))}
                selected={[form.form.businessType]}
                onToggle={form.selectBusinessType}
            />
        </FormScreen>
    );
};