import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import ChevronRightIcon from '@/assets/figma/chevron-right.svg';
import KeyIcon from '@/assets/figma/key-round.svg';
import { FlowHeading } from '@/components/shiftFlow';
import { EmptyState } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { toRosterMember } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { WorkerAvatar } from './components';
import { useBusinessApplicantStore } from './store/useBusinessApplicantStore';

/** Statuses where the worker still needs the check-in code. */
const CODE_STATUSES = new Set(['confirmed', 'en_route']);
const DONE_STATUSES = new Set(['checked_in', 'checked_out', 'approved']);
const BAD_STATUSES = new Set(['no_show', 'cancelled']);

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
const timeLabel = (iso: string) =>
  new Date(iso)
    .toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();

/** Everyone booked on one shift, as on web; each row opens the worker's booking. */
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
    upsert(result.items.map(entry => toRosterMember(entry, shift.job_title)));
    return result;
  }, [shift?.id]);
  const entries = roster.data?.items ?? [];
  const isFull = roster.data
    ? roster.data.booked_count >= roster.data.workers_required
    : false;

  const statusColors = (status: string) =>
    DONE_STATUSES.has(status)
      ? { color: colors.success, backgroundColor: colors.successSoft }
      : BAD_STATUSES.has(status)
      ? { color: colors.danger, backgroundColor: colors.dangerSoft }
      : { color: colors.primary, backgroundColor: colors.primarySoft };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      compactTitle
      headerTag={t('businessApplicants.headerTag')}
      gap={14}
      fillLastBlock={entries.length === 0}
      isLoading={data.isLoading || roster.isLoading}
      testID="business-roster-page"
    >
      <FlowHeading
        overline={t('businessRoster.bookedOverline', {
          booked: roster.data?.booked_count ?? 0,
          required: roster.data?.workers_required ?? 0,
        })}
        tone={isFull ? 'success' : 'primary'}
        title={shift?.job_title ?? t('bookedWorkers.title')}
        subtitle={
          shift
            ? `${dateLabel(shift.starts_at)} · ${timeLabel(
                shift.starts_at,
              )} – ${timeLabel(shift.ends_at)}`
            : undefined
        }
      />
      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarDaysIcon}
          title={
            data.error || roster.error || t('businessShifts.emptyRosterTitle')
          }
          body={t('businessShifts.emptyRosterBody')}
        />
      ) : (
        <View style={styles.list}>
          {entries.map(entry => {
            const { worker } = entry;
            const tone = statusColors(entry.status);
            return (
              <Pressable
                key={entry.assignment_id}
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate(ROUTES.businessScheduledWorkerTracking, {
                    assignmentId: entry.assignment_id,
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  {
                    borderColor: pressed ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                testID={`business-roster-row-${entry.assignment_id}`}
              >
                <WorkerAvatar
                  name={worker.full_name}
                  photoUrl={worker.photo_url}
                  size={44}
                />
                <View style={styles.body}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.text }]}
                  >
                    {worker.full_name}
                  </Text>
                  <Text style={[styles.meta, { color: colors.textSubtle }]}>
                    {worker.rating_count > 0
                      ? `★ ${worker.rating_avg.toFixed(1)} (${
                          worker.rating_count
                        }) · `
                      : ''}
                    {t('bookedWorkers.shiftsDone', {
                      count: worker.completed_shift_count,
                    })}
                  </Text>
                  {entry.check_in_code && CODE_STATUSES.has(entry.status) ? (
                    <View
                      style={[styles.code, { backgroundColor: colors.fill }]}
                    >
                      <KeyIcon width={12} height={12} color={colors.text} />
                      <Text style={[styles.codeText, { color: colors.text }]}>
                        {t('businessRoster.code', {
                          code: entry.check_in_code,
                        })}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.status, tone]}>
                  {t(`bookingDetail.status.${entry.status}`, {
                    defaultValue: entry.status,
                  })}
                </Text>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  color={colors.textSubtle}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </FormScreen>
  );
};

/** Web `.roster-card`, `.roster-status`, `.roster-code`. */
const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  body: { flex: 1, gap: 3 },
  name: { fontFamily: FONTS.semiBold, fontSize: 15 },
  meta: { fontFamily: FONTS.regular, fontSize: 12 },
  code: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  codeText: { fontFamily: FONTS.semiBold, fontSize: 12, letterSpacing: 0.5 },
  status: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
});
