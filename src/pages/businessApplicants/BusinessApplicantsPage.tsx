import type { FC } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
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

import { formatDateLabel, formatTimeRange } from '@/services/shifts/shiftMappers';

import { ApplicantsSortSheet, BusinessApplicantRow } from './components';
import { BOOKED_WORKERS_STRINGS as BOOKED_STRINGS } from './constants/bookedWorkersStrings';
import { useBusinessApplicants } from './hooks';

/** One section per shift: which job and when, then the workers booked on it. */
const groupByShift = (items: BusinessApplicant[]) => {
    const groups = new Map<
        string,
        { key: string; title: string; meta: string; items: BusinessApplicant[] }
    >();
    for (const item of items) {
        const key = item.shiftId ?? item.id;
        const group = groups.get(key) ?? {
            key,
            title: item.category,
            meta: [
                item.startsAt ? formatDateLabel(item.startsAt) : '',
                item.startsAt && item.endsAt ? formatTimeRange(item.startsAt, item.endsAt) : '',
                item.workplace ?? '',
            ]
                .filter(Boolean)
                .join(' · '),
            items: [],
        };
        group.items.push(item);
        groups.set(key, group);
    }
    return [...groups.values()];
};

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
        <Text key="title" accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {BOOKED_STRINGS.TITLE}
        </Text>,
        <Text key="subtitle" style={[styles.subtitle, { color: colors.textSubtle }]}>
            {BOOKED_STRINGS.SUBTITLE}
        </Text>,
        ...(applicants.applicants.length
            ? groupByShift(applicants.applicants).map(group => (
                  <View key={group.key} style={styles.group}>
                      <View style={styles.groupHeader}>
                          <View style={styles.groupCopy}>
                              <Text style={[styles.groupTitle, { color: colors.text }]}>
                                  {group.title}
                              </Text>
                              <Text style={[styles.groupMeta, { color: colors.textSubtle }]}>
                                  {group.meta}
                              </Text>
                          </View>
                          <Text
                              style={[
                                  styles.groupCount,
                                  { color: colors.primary, backgroundColor: colors.primarySoft },
                              ]}
                          >
                              {BOOKED_STRINGS.bookedCount(group.items.length)}
                          </Text>
                      </View>
                      {group.items.map(applicant => (
                          <BusinessApplicantRow
                              key={applicant.id}
                              applicant={applicant}
                              onOpenProfile={
                                  applicant.workerId
                                      ? () =>
                                            navigation.navigate(ROUTES.businessWorkerProfile, {
                                                workerId: applicant.workerId as string,
                                            })
                                      : undefined
                              }
                              onOpenBooking={
                                  applicant.assignmentId ? () => openBooking(applicant) : undefined
                              }
                          />
                      ))}
                  </View>
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
    title: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25 },
    subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
    actions: { gap: 8 },
    group: { gap: 10, marginTop: 6 },
    groupHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    groupCopy: { flex: 1, gap: 2 },
    groupTitle: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 22 },
    groupMeta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
    groupCount: {
        overflow: 'hidden',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontFamily: FONTS.semiBold,
        fontSize: 11,
        lineHeight: 15,
    },
});
