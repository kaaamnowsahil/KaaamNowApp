import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { meApi } from '@/services/api/meApi';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { getDurationHours, parseLocalDate, toBulkItems } from './utils';

export const BusinessShiftReviewPage: FC<
  AppScreenProps<typeof ROUTES.businessShiftReview>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { draft } = route.params;
  const { busy, run } = useShiftAction();
  const categories = useApiQuery(() => meApi.workCategories(), []);
  const categoryLabel = (slug: string) =>
    categories.data?.find(category => category.id === slug)?.label ?? slug;
  const schedules = draft.schedules.map(schedule => ({
    ...schedule,
    date: new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'full',
    }).format(parseLocalDate(schedule.date)),
    time: `${schedule.startTime}–${schedule.endTime}`,
    hours: getDurationHours(schedule.startTime, schedule.endTime),
  }));
  const post = () =>
    run(
      () => shiftsApi.createBulk({ publish: true, shifts: toBulkItems(draft) }),
      () => navigation.replace(ROUTES.businessShiftPosted, { draft }),
    );

  return (
    <FormScreen
      busy={busy}
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessDashboard.scheduledStatus')}
      headerTag={t('businessApplicants.headerTag')}
      gap={14}
      testID="business-shift-review-page"
      actions={
        <PrimaryButton
          label={t('businessShiftCreate.postShift')}
          onPress={post}
          disabled={busy}
          testID="business-shift-post"
        />
      }
    >
      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {t('businessDashboard.scheduledStatus')} ·{' '}
          {t('businessShiftCreate.draftStatus')}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {t('businessShiftCreate.review')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
          {[draft.role, draft.location].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <ReviewRow
          label={t('businessShiftCreate.date')}
          value={t('businessShiftCreate.selectedDates', {
            count: draft.schedules.length,
          })}
        />
        {schedules.map(schedule => (
          <View key={schedule.date} style={styles.scheduleReview}>
            <ReviewRow
              label={schedule.date}
              value={`${schedule.role} · ${schedule.time} · ${t(
                'businessShiftCreate.hoursDuration',
                { hours: schedule.hours },
              )}`}
            />
            <ReviewRow
              label={t('businessLiveCreate.category')}
              value={categoryLabel(schedule.category)}
            />
            <ReviewRow
              label={t('businessLiveCreate.requirement')}
              value={schedule.requirement}
            />
            <ReviewRow
              label={t('businessShiftCreate.responsibilities')}
              value={schedule.responsibilities}
            />
            <ReviewRow
              label={t('businessShiftCreate.payAndHeadcount')}
              value={t('businessShiftCreate.paySummary', {
                workers: Number(schedule.workers),
                rate: formatRupees(Number(schedule.hourlyRate)),
              })}
              isLast
            />
          </View>
        ))}
      </View>

      <Text style={[styles.note, { color: colors.textSubtle }]}>
        {t('businessShiftCreate.reviewNote')}
      </Text>
    </FormScreen>
  );
};

const ReviewRow: FC<{
  label: string;
  value: string;
  isLast?: boolean;
}> = ({ label, value, isLast }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.reviewRow,
        { borderBottomColor: colors.border },
        isLast && styles.lastReviewRow,
      ]}
    >
      <Text style={[styles.rowLabel, { color: colors.textSubtle }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 5 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  scheduleReview: { borderBottomWidth: 1 },
  reviewRow: {
    paddingVertical: 12,
    gap: 5,
    borderBottomWidth: 1,
  },
  lastReviewRow: { borderBottomWidth: 0 },
  rowLabel: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  rowValue: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 19 },
  note: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
});
