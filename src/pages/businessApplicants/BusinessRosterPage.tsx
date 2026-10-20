import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { BUSINESS_DASHBOARD, BUSINESS_ROSTER } from '@/pages/businessLive/mock';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { useBusinessApplicantStore } from './store/useBusinessApplicantStore';

export const BusinessRosterPage: FC<AppScreenProps<typeof ROUTES.businessRoster>> = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const applicants = useBusinessApplicantStore(state => state.applicants);
    const confirmedWorkers = applicants.filter(
        applicant => applicant.status === 'confirmed',
    );
    const scheduledShift = BUSINESS_DASHBOARD.scheduledShifts[0];

    return (
        <FormScreen
            onBack={navigation.goBack}
            title={t('businessApplicants.headerTitle')}
            subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
            headerTag={t('businessApplicants.headerTag')}
            gap={10}
            testID="business-roster-page"
            actions={
                <>
                    <PrimaryButton
                        label={t('businessRoster.sendReminder')}
                        onPress={() =>
                            Alert.alert(t('businessRoster.reminderSentTitle'), t('businessRoster.reminderSentBody'))
                        }
                        testID="business-roster-remind"
                    />
                    <SecondaryButton
                        label={t('businessRoster.viewSelectedOffers')}
                        onPress={() =>
                            navigation.navigate(ROUTES.mainTabs, {
                                screen: ROUTES.businessApplicants,
                                params: { status: 'selected' },
                            })
                        }
                        testID="business-roster-selected-offers"
                    />
                </>
            }
        >
            <Text style={[styles.overline, { color: colors.success }]}>
                {t('businessShifts.fullyStaffed', {
                    count: BUSINESS_ROSTER.staffedCount,
                    total: Math.max(
                        BUSINESS_ROSTER.totalCount,
                        confirmedWorkers.length,
                    ),
                })}
            </Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                {t('businessShifts.rosterTitle')}
            </Text>
            <View style={styles.list}>
                {confirmedWorkers.map((member, index) => (
                    <Pressable
                        key={member.id}
                        accessibilityRole="button"
                        onPress={() =>
                            navigation.navigate(ROUTES.businessScheduledWorkerTracking, {
                                applicantId: member.id,
                                role: scheduledShift.title,
                                business: BUSINESS_DASHBOARD.businessName,
                                hourlyRate: scheduledShift.hourlyRate,
                                hours: scheduledShift.hours,
                                date: scheduledShift.date,
                            })
                        }
                        style={[
                            styles.row,
                            index < confirmedWorkers.length - 1 && {
                                borderBottomColor: colors.border,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            },
                        ]}
                    >
                        <View style={styles.member}>
                            <Text style={[styles.name, { color: colors.text }]}>{member.name}</Text>
                            <Text style={[styles.meta, { color: colors.textSubtle }]}>
                                {t('businessRoster.shiftTrackingHint', {
                                    rate: scheduledShift.hourlyRate,
                                    hours: scheduledShift.hours,
                                })}
                            </Text>
                        </View>
                        <Text style={[styles.status, { color: colors.success }]}>
                            {t('businessApplicants.status.confirmed')}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </FormScreen>
    );
};

const styles = StyleSheet.create({
    overline: {
        fontFamily: FONTS.semiBold,
        fontSize: 9,
        lineHeight: 14,
        textTransform: 'uppercase',
    },
    title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 27 },
    list: { marginTop: 2 },
    row: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    member: { flex: 1, gap: 2 },
    name: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16 },
    meta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
    status: { fontFamily: FONTS.semiBold, fontSize: 9, lineHeight: 13 },
});
