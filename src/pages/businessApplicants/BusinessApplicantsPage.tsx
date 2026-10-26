import type { FC } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
    BackButton,
    BrandAppBar,
    EmptyState,
    PrimaryButton,
    SecondaryButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { TabScreen } from '@/layout/TabScreen';
import type { TabAppNavigation } from '@/types';
import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import { useTheme } from '@/theme/ThemeProvider';
import type { BusinessApplicant, TabParamList } from '@/types';

const BOOKED_STRINGS = {
    TITLE: 'Booked workers',
    SUBTITLE: 'Workers book open seats directly. Tap someone to see their booking and check-in code.',
    EMPTY_TITLE: 'No bookings yet',
    EMPTY_BODY: 'When workers book your shifts, they’ll appear here.',
} as const;

import { ApplicantsSortSheet, BusinessApplicantRow } from './components';
import { useBusinessApplicants } from './hooks';

export const BusinessApplicantsPage: FC = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const navigation = useNavigation<TabAppNavigation>();
    const route =
        useRoute<RouteProp<TabParamList, typeof ROUTES.businessApplicants>>();
    const applicants = useBusinessApplicants('confirmed');
    useEffect(() => {
        if (route.params?.status) navigation.setParams({ status: undefined });
    }, [navigation, route.params?.status]);

    const openBooking = (applicant: BusinessApplicant) =>
        applicant.assignmentId
            ? navigation.navigate(ROUTES.businessScheduledWorkerTracking, {
                  assignmentId: applicant.assignmentId,
              })
            : navigation.navigate(ROUTES.businessApplicantProfile, { applicantId: applicant.id });

    const openRoster = () => navigation.navigate(ROUTES.businessRoster);

    const header = (
        <BrandAppBar onBellPress={() => navigation.navigate(ROUTES.notifications)} />
    );

    const blocks = [
        <View key="back" style={styles.backRow}>
            <BackButton onPress={() => navigation.navigate(ROUTES.businessLive)} />
            <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.text }]}>
                {t('businessApplicants.headerTitle')}
            </Text>
            <Text style={[styles.headerTag, { color: colors.textSubtle }]}>
                {t('businessApplicants.headerTag')}
            </Text>
        </View>,
        <Text key="title" accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {BOOKED_STRINGS.TITLE}
        </Text>,
        <Text key="subtitle" style={[styles.subtitle, { color: colors.textSubtle }]}>
            {BOOKED_STRINGS.SUBTITLE}
        </Text>,
        ...(applicants.applicants.length
            ? applicants.applicants.map((applicant, index) => (
                  <BusinessApplicantRow
                      key={applicant.id}
                      applicant={applicant}
                      isLast={index === applicants.applicants.length - 1}
                      onPress={() => openBooking(applicant)}
                  />
              ))
            : applicants.error
            ? [
                  <EmptyState
                      key="error"
                      icon={CalendarDaysIcon}
                      title={t('businessApplicants.loadErrorTitle')}
                      body={applicants.error}
                      action={t('businessApplicants.retry')}
                      onAction={applicants.reload}
                  />,
              ]
            : [
                  <EmptyState
                      key="empty"
                      icon={CalendarDaysIcon}
                      title={BOOKED_STRINGS.EMPTY_TITLE}
                      body={BOOKED_STRINGS.EMPTY_BODY}
                  />,
              ]),
    ];

    return (
        <>
            <TabScreen
                header={header}
                blocks={blocks}
                fillLastBlock={!applicants.applicants.length}
                gap={10}
                isLoading={applicants.isLoading}
                testID="business-applicants-page"
                actions={
                    <View style={styles.actions}>
                        <PrimaryButton
                            label={t('businessShifts.rosterTitle')}
                            onPress={openRoster}
                        />
                        <SecondaryButton
                            label={t('businessApplicants.filterSort')}
                            onPress={applicants.openSort}
                        />
                    </View>
                }
            />
            {applicants.isSortOpen ? (
                <ApplicantsSortSheet
                    sort={applicants.sort}
                    onSort={sort => {
                        applicants.setSort(sort);
                        applicants.closeSort();
                    }}
                    onClose={applicants.closeSort}
                />
            ) : null}
        </>
    );
};

const styles = StyleSheet.create({
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
    headerTitle: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
    headerTag: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
    title: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25 },
    subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
    actions: { gap: 8 },
});
