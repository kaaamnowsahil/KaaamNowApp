import type { FC } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    BackButton,
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
import type { TabParamList } from '@/types';

import { ApplicantsSortSheet, BusinessApplicantRow } from './components';
import { useBusinessApplicants } from './hooks';

export const BusinessApplicantsPage: FC = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const navigation = useNavigation<TabAppNavigation>();
    const route =
        useRoute<RouteProp<TabParamList, typeof ROUTES.businessApplicants>>();
    const applicants = useBusinessApplicants(route.params?.status ?? 'applied');
    const setApplicantStatus = applicants.setStatus;
    useEffect(() => {
        const requestedStatus = route.params?.status;
        if (requestedStatus) {
            setApplicantStatus(currentStatus =>
                currentStatus === requestedStatus ? currentStatus : requestedStatus,
            );
            navigation.setParams({ status: undefined });
        }
    }, [navigation, route.params?.status, setApplicantStatus]);

    const openApplicant = () => {
        if (!applicants.activeApplicant) return;
        navigation.navigate(ROUTES.businessApplicantProfile, {
            applicantId: applicants.activeApplicant.id,
        });
    };

    const openRoster = () => navigation.navigate(ROUTES.businessRoster);

    const header = (
        <>
            <BackButton onPress={() => navigation.navigate(ROUTES.businessLive)} />
            <Text accessibilityRole="header" style={[styles.headerTitle, { color: colors.text }]}>
                {t('businessApplicants.headerTitle')}
            </Text>
            <Text style={[styles.headerTag, { color: colors.textSubtle }]}>
                {t('businessApplicants.headerTag')}
            </Text>
        </>
    );

    const blocks = [
        <Text key="title" accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {t('businessApplicants.title')}
        </Text>,
        <View key="tabs" style={[styles.tabs, { backgroundColor: colors.fill, borderColor: colors.border }]}>
            {(['applied', 'selected', 'confirmed'] as const).map(status => {
                const active = applicants.status === status;
                return (
                    <Pressable
                        key={status}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        onPress={() => applicants.setStatus(status)}
                        style={[styles.tab, active && { backgroundColor: colors.primary }]}
                    >
                        <Text style={{ color: active ? colors.onPrimary : colors.textMuted }}>
                            {t(`businessApplicants.tabs.${status}`)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>,
        ...(applicants.applicants.length
            ? applicants.applicants.map((applicant, index) => (
                  <BusinessApplicantRow
                      key={applicant.id}
                      applicant={applicant}
                      isLast={index === applicants.applicants.length - 1}
                      onPress={() => navigation.navigate(ROUTES.businessApplicantProfile, {
                          applicantId: applicant.id,
                      })}
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
                      title={t('businessApplicants.emptyTitle')}
                      body={t('businessApplicants.emptyBody')}
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
                            label={t(
                                applicants.status === 'confirmed'
                                    ? 'businessShifts.rosterTitle'
                                    : 'businessApplicantProfile.reviewApplicant',
                            )}
                            onPress={
                                applicants.status === 'confirmed'
                                    ? openRoster
                                    : openApplicant
                            }
                            disabled={
                                applicants.status !== 'confirmed' &&
                                !applicants.activeApplicant
                            }
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
    headerTitle: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
    headerTag: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
    title: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25 },
    tabs: { flexDirection: 'row', gap: 4, padding: 4, borderWidth: 1, borderRadius: 10 },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 34, borderRadius: 7 },
    actions: { gap: 8 },
});
