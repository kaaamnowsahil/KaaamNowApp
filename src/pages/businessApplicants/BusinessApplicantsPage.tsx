import type { FC } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
    BrandAppBar,
    EmptyState,
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
import { useBusinessApplicants, type ApplicantSort } from './hooks';

type ShiftGroup = {
    key: string;
    title: string;
    meta: string;
    startsAt: string;
    hourlyRateMinor: number;
    items: BusinessApplicant[];
    left: BusinessApplicant[];
};

const nearestIn = (group: ShiftGroup) =>
    Math.min(...[...group.items, ...group.left].map(item => item.distanceKm ?? Infinity));

/** One section per shift: which job and when, the workers booked on it, then who withdrew. */
const groupByShift = (
    booked: BusinessApplicant[],
    left: BusinessApplicant[],
    sort: ApplicantSort,
) => {
    const groups = new Map<string, ShiftGroup>();
    const groupFor = (item: BusinessApplicant) => {
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
            startsAt: item.startsAt ?? '',
            hourlyRateMinor: item.hourlyRateMinor ?? 0,
            items: [],
            left: [],
        };
        groups.set(key, group);
        return group;
    };
    for (const item of booked) groupFor(item).items.push(item);
    for (const item of left) groupFor(item).left.push(item);
    return [...groups.values()].sort((a, b) => {
        if (sort === 'pay') return b.hourlyRateMinor - a.hourlyRateMinor;
        if (sort === 'nearest') return nearestIn(a) - nearestIn(b);
        return a.startsAt.localeCompare(b.startsAt);
    });
};

export const BusinessApplicantsPage: FC = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const navigation = useNavigation<TabAppNavigation>();
    const route =
        useRoute<RouteProp<TabParamList, typeof ROUTES.businessApplicants>>();
    const applicants = useBusinessApplicants('confirmed');
    const allGroups = groupByShift(applicants.applicants, applicants.withdrawn, applicants.sort);
    const groups = allGroups.filter(
        group => applicants.shiftId === 'all' || group.key === applicants.shiftId,
    );
    const hasWorkers = groups.length > 0;
    const shiftOptions = [...allGroups]
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map(group => ({
            id: group.key,
            label: group.startsAt
                ? `${group.title} · ${formatDateLabel(group.startsAt)}`
                : group.title,
        }));
    useEffect(() => {
        if (route.params?.status) navigation.setParams({ status: undefined });
    }, [navigation, route.params?.status]);

    const openBooking = (applicant: BusinessApplicant) =>
        applicant.assignmentId
            ? navigation.navigate(ROUTES.businessScheduledWorkerTracking, {
                  assignmentId: applicant.assignmentId,
              })
            : navigation.navigate(ROUTES.businessApplicantProfile, { applicantId: applicant.id });

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
        ...(hasWorkers
            ? groups.map(group => (
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
                      {group.left.length ? (
                          <Text style={[styles.leftHeading, { color: colors.danger }]}>
                              {BOOKED_STRINGS.withdrewHeading(group.left.length)}
                          </Text>
                      ) : null}
                      {group.left.map(applicant => (
                          <BusinessApplicantRow
                              key={applicant.id}
                              applicant={applicant}
                              left
                              onOpenProfile={
                                  applicant.workerId
                                      ? () =>
                                            navigation.navigate(ROUTES.businessWorkerProfile, {
                                                workerId: applicant.workerId as string,
                                            })
                                      : undefined
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
                fillLastBlock={!hasWorkers}
                gap={10}
                isLoading={applicants.isLoading}
                testID="business-applicants-page"
                actions={
                    <SecondaryButton
                        label={t('businessApplicants.filterSort')}
                        onPress={applicants.openSort}
                    />
                }
            />
            {applicants.isSortOpen ? (
                <ApplicantsSortSheet
                    sort={applicants.sort}
                    shiftId={applicants.shiftId}
                    shifts={shiftOptions}
                    onSort={applicants.setSort}
                    onShift={applicants.setShiftId}
                    onClose={applicants.closeSort}
                />
            ) : null}
        </>
    );
};

const styles = StyleSheet.create({
    title: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 25 },
    subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
    group: { gap: 10, marginTop: 6 },
    groupHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    groupCopy: { flex: 1, gap: 2 },
    groupTitle: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 22 },
    groupMeta: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
    leftHeading: { marginTop: 4, fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
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
