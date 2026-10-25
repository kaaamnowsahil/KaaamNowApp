import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import { EmptyState, PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  formatDateLabel,
  fromMinor,
  toRosterMember,
} from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { useBusinessApplicantStore } from './store/useBusinessApplicantStore';

export const BusinessRosterPage: FC<
  AppScreenProps<typeof ROUTES.businessRoster>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const data = useBusinessShiftsData();
  const shiftId = route.params?.shiftId;
  const shift =
    [...data.scheduledShifts, ...data.liveShifts].find(
      item => item.id === shiftId,
    ) ?? data.scheduledShifts.find(item => item.booked_count > 0);
  const upsert = useBusinessApplicantStore(state => state.upsert);
  const roster = useApiQuery(async () => {
    if (!shift) return null;
    const result = await shiftsApi.roster(shift.id);
    const members = result.items
      .filter(
        entry => entry.status !== 'cancelled' && entry.status !== 'no_show',
      )
      .map(entry => toRosterMember(entry, shift.job_title));
    upsert(members);
    return { ...result, members };
  }, [shift?.id]);
  const confirmedWorkers = roster.data?.members ?? [];
  const hourlyRate = shift ? fromMinor(shift.hourly_rate_minor) : 0;
  const hours = shift
    ? Math.round((shift.estimate.paid_minutes_per_worker / 60) * 10) / 10
    : 0;

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
      headerTag={t('businessApplicants.headerTag')}
      gap={10}
      fillLastBlock={confirmedWorkers.length === 0}
      isLoading={data.isLoading || roster.isLoading}
      testID="business-roster-page"
      actions={
        <PrimaryButton
          label={t('businessRoster.viewSelectedOffers')}
          onPress={() =>
            navigation.navigate(ROUTES.mainTabs, {
              screen: ROUTES.businessApplicants,
              params: { status: 'selected' },
            })
          }
          testID="business-roster-selected-offers"
        />
      }
    >
      <Text style={[styles.overline, { color: colors.success }]}>
        {t('businessShifts.fullyStaffed', {
          count: roster.data?.booked_count ?? 0,
          total: roster.data?.workers_required ?? 0,
        })}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {t('businessShifts.rosterTitle')}
      </Text>
      {confirmedWorkers.length === 0 ? (
        <EmptyState
          icon={CalendarDaysIcon}
          title={
            data.error || roster.error || t('businessShifts.emptyRosterTitle')
          }
          body={t('businessShifts.emptyRosterBody')}
        />
      ) : (
        <View style={styles.list}>
          {confirmedWorkers.map((member, index) => (
            <Pressable
              key={member.id}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate(ROUTES.businessScheduledWorkerTracking, {
                  applicantId: member.id,
                  role: shift?.job_title ?? '',
                  business: data.businessName,
                  hourlyRate,
                  hours,
                  date: shift ? formatDateLabel(shift.starts_at) : '',
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
                <Text style={[styles.name, { color: colors.text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                  {t('businessRoster.shiftTrackingHint', {
                    rate: hourlyRate,
                    hours,
                  })}
                </Text>
              </View>
              <Text style={[styles.status, { color: colors.success }]}>
                {t('businessApplicants.status.confirmed')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
