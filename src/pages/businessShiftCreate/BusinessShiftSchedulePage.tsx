import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenIntro, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { BusinessShiftCalendar, ShiftFormField } from './components';
import { useBusinessShiftSchedule } from './hooks';
import { getDurationHours, parseLocalDate } from './utils';

export const BusinessShiftSchedulePage: FC<
  AppScreenProps<typeof ROUTES.businessShiftSchedule>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const schedule = useBusinessShiftSchedule(route.params?.draft, {
    responsibilities: t('businessShiftCreate.defaultResponsibilities'),
    role: t('businessShiftCreate.defaultRole'),
  });
  const selectedDates = schedule.draft.schedules.map(({ date }) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
    }).format(parseLocalDate(date)),
  );

  const review = () => {
    const validation = schedule.validate();
    if (!validation.isFutureDate) {
      Alert.alert(t('businessShiftCreate.invalidDate'));
      return;
    }
    if (!validation.isValid) {
      Alert.alert(t('businessShiftCreate.invalidForm'));
      return;
    }
    navigation.navigate(ROUTES.businessShiftReview, { draft: schedule.draft });
  };

  const save = () => {
    schedule.save();
    navigation.navigate(ROUTES.mainTabs, { screen: ROUTES.businessShifts });
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessDashboard.scheduledStatus')}
      headerTag={t('businessApplicants.headerTag')}
      gap={12}
      testID="business-shift-schedule-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessShiftCreate.review')}
            onPress={review}
            testID="business-shift-review"
          />
          <SecondaryButton
            label={t('businessShiftCreate.saveDraft')}
            onPress={save}
            testID="business-shift-save-draft"
          />
        </>
      }
    >
      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {t('businessDashboard.scheduledStatus')} ·{' '}
          {t('businessShiftCreate.draftStatus')}
        </Text>
        <ScreenIntro
          title={t('businessShiftCreate.prompt')}
          subtitle={`${schedule.draft.role} · ${schedule.draft.location}`}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.date')}
        </Text>
        <Text style={[styles.selectedDate, { color: colors.text }]}>
          {t('businessShiftCreate.selectedDates', {
            count: selectedDates.length,
          })}
        </Text>
        <Text style={[styles.dateList, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.selectMultipleDates')}
        </Text>
        <BusinessShiftCalendar
          value={schedule.draft.schedules.map(({ date }) => date)}
          onChange={schedule.updateDates}
        />
        {selectedDates.length > 0 ? (
          <Text style={[styles.dateList, { color: colors.textSubtle }]}>
            {selectedDates.join(' · ')}
          </Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.perDateSchedule')}
        </Text>
        {schedule.draft.schedules.map(daySchedule => (
          <View
            key={daySchedule.date}
            style={[
              styles.dateSchedule,
              { backgroundColor: colors.fill },
            ]}
          >
            <Text style={[styles.selectedDate, { color: colors.text }]}>
              {new Intl.DateTimeFormat(i18n.language, {
                dateStyle: 'medium',
              }).format(parseLocalDate(daySchedule.date))}
            </Text>
            <View style={styles.row}>
              <ShiftFormField
                label={t('businessShiftCreate.start')}
                value={daySchedule.startTime}
                onChangeText={startTime =>
                  schedule.updateSchedule(daySchedule.date, { startTime })
                }
                keyboardType="numbers-and-punctuation"
                placeholder="10:00"
                maxLength={5}
                testID={`business-shift-start-${daySchedule.date}`}
              />
              <ShiftFormField
                label={t('businessShiftCreate.end')}
                value={daySchedule.endTime}
                onChangeText={endTime =>
                  schedule.updateSchedule(daySchedule.date, { endTime })
                }
                keyboardType="numbers-and-punctuation"
                placeholder="16:00"
                maxLength={5}
                testID={`business-shift-end-${daySchedule.date}`}
              />
            </View>
            <Text style={[styles.dateList, { color: colors.textSubtle }]}>
              {t('businessShiftCreate.hoursDuration', {
                hours: getDurationHours(
                  daySchedule.startTime,
                  daySchedule.endTime,
                ),
              })}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.payAndHeadcount')}
        </Text>
        <View style={styles.row}>
          <ShiftFormField
            label={t('businessShiftCreate.workers')}
            value={schedule.draft.workers}
            onChangeText={workers => schedule.update({ workers })}
            keyboardType="number-pad"
            testID="business-shift-workers"
          />
          <ShiftFormField
            label={t('businessShiftCreate.hourlyPay')}
            value={schedule.draft.hourlyRate}
            onChangeText={hourlyRate => schedule.update({ hourlyRate })}
            keyboardType="number-pad"
            prefix="₹"
            testID="business-shift-hourly-pay"
          />
        </View>
      </View>

      <ShiftFormField
        label={t('businessShiftCreate.responsibilities')}
        value={schedule.draft.responsibilities}
        onChangeText={responsibilities => schedule.update({ responsibilities })}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
        testID="business-shift-responsibilities"
      />
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 4 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  field: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  selectedDate: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  dateList: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 8 },
  dateSchedule: { gap: 8, padding: 10, borderRadius: 10 },
  multiline: { minHeight: 72, paddingTop: 10 },
});
