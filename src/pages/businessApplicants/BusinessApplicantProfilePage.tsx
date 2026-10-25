import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { FlowHeading, InfoCard, StatTiles } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
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
    const remove = useBusinessApplicantStore(state => state.remove);
    const { busy, run } = useShiftAction();

    if (!applicant) {
        return (
            <FormScreen
                busy={busy}
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
    const actionFailed = t('businessApplicantProfile.actionFailed');
    const select = () =>
        run(
            () => shiftsApi.selectApplicant(applicant.id),
            () => {
                updateStatus(applicant.id, 'selected');
                navigation.goBack();
            },
            actionFailed,
        );
    const reject = () =>
        run(
            () => shiftsApi.rejectApplicant(applicant.id),
            () => {
                remove(applicant.id);
                navigation.goBack();
            },
            actionFailed,
        );

    return (
        <FormScreen
            busy={busy}
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
                                  ? 'businessApplicantProfile.awaitingWorker'
                                  : 'businessApplicantProfile.alreadyConfirmed',
                        )}
                        onPress={select}
                        disabled={!isApplied || busy}
                        testID="business-applicant-accept"
                    />
                    <SecondaryButton
                        label={t(
                            isApplied
                                ? 'businessApplicantProfile.reject'
                                : 'businessApplicantProfile.close',
                        )}
                        onPress={isApplied ? reject : navigation.goBack}
                        disabled={busy}
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
            {applicant.about ? (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('businessApplicantProfile.about')}
                    </Text>
                    <Text style={[styles.body, { color: colors.textSubtle }]}>
                        {applicant.about}
                    </Text>
                </View>
            ) : null}
            {applicant.skills.length ? (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('businessApplicantProfile.skills')}
                    </Text>
                    <Text style={[styles.body, { color: colors.textSubtle }]}>
                        {applicant.skills.join(' · ')}
                    </Text>
                </View>
            ) : null}
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
