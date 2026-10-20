import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { FlowHeading, InfoCard, StatTiles } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { useBusinessApplicantStore } from './store/useBusinessApplicantStore';

export const BusinessApplicantProfilePage: FC<
    AppScreenProps<typeof ROUTES.businessApplicantProfile>
> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const applicant = useBusinessApplicantStore(state =>
        state.applicants.find(item => item.id === route.params.applicantId),
    );
    const updateStatus = useBusinessApplicantStore(state => state.updateStatus);

    if (!applicant) {
        return (
            <FormScreen
                onBack={navigation.goBack}
                title={t('businessApplicantProfile.title')}
                subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
                headerTag={t('businessApplicants.headerTag')}
                testID="business-applicant-profile-page"
            >
                <FlowHeading
                    title={t('businessApplicantProfile.notFoundTitle')}
                    subtitle={t('businessApplicantProfile.notFoundBody')}
                />
            </FormScreen>
        );
    }

    const isApplied = applicant.status === 'applied';
    const isSelected = applicant.status === 'selected';
    const canAdvance = isApplied || isSelected;
    const advanceStatus = () => {
        if (!canAdvance) return;
        updateStatus(applicant.id, isApplied ? 'selected' : 'confirmed');
        navigation.goBack();
    };

    return (
        <FormScreen
            onBack={navigation.goBack}
            title={t('businessApplicants.headerTitle')}
            subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
            headerTag={t('businessApplicants.headerTag')}
            gap={12}
            testID="business-applicant-profile-page"
            actions={
                <>
                    <PrimaryButton
                        label={t(
                            isApplied
                                ? 'businessApplicantProfile.acceptApplicant'
                                : isSelected
                                  ? 'businessApplicantProfile.confirmApplicant'
                                  : 'businessApplicantProfile.alreadyConfirmed',
                        )}
                        onPress={advanceStatus}
                        disabled={!canAdvance}
                        testID="business-applicant-accept"
                    />
                    <SecondaryButton
                        label={t('businessApplicantProfile.close')}
                        onPress={navigation.goBack}
                        testID="business-applicant-close"
                    />
                </>
            }
        >
            <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.initial, { color: colors.primary }]}>
                    {applicant.name.charAt(0)}
                </Text>
            </View>
            <FlowHeading
                title={applicant.name}
                subtitle={t(`businessApplicants.status.${applicant.status}`)}
            />
            <StatTiles
                items={[
                    {
                        value: applicant.experience,
                        label: t('businessApplicantProfile.experience'),
                    },
                    {
                        value: applicant.rating.toFixed(1),
                        label: t('businessApplicantProfile.rating'),
                        tone: 'success',
                    },
                ]}
            />
            <InfoCard
                title={t('businessApplicantProfile.roleTitle')}
                caption={applicant.category}
            />
            <InfoCard
                title={t('businessApplicantProfile.locationTitle')}
                caption={applicant.location}
            />
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('businessApplicantProfile.about')}
                </Text>
                <Text style={[styles.body, { color: colors.textSubtle }]}>
                    {applicant.about}
                </Text>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('businessApplicantProfile.skills')}
                </Text>
                <Text style={[styles.body, { color: colors.textSubtle }]}>
                    {applicant.skills.join(' · ')}
                </Text>
            </View>
        </FormScreen>
    );
};

const styles = StyleSheet.create({
    avatar: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        alignSelf: 'center',
    },
    initial: { fontFamily: FONTS.bold, fontSize: 28, lineHeight: 36 },
    section: { gap: 4 },
    sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
    body: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
});
