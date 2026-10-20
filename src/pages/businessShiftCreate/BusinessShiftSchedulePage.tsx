import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenIntro, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { BUSINESS_TYPES } from '@/pages/businessSignup/mock';
import { ROUTES } from '@/constants/routes';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
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
  const businessType =
    useOnboardingStore(state => state.business?.businessType) ?? 'hospitality';
  const schedule = useBusinessShiftSchedule(route.params?.draft, {
    responsibilities: t('businessShiftCreate.defaultResponsibilities'),
    role: t('businessShiftCreate.defaultRole'),
    category: businessType,
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
    navigation.navigate(ROUTES.businessShiftReview, {
      draft: { ...schedule.draft, role: schedule.draft.role.trim() },
    });
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

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: Boolean(schedule.draft.sameForEveryDate),
        }}
        onPress={() =>
          schedule.setSameForEveryDate(!schedule.draft.sameForEveryDate)
        }
        style={styles.sameDatesToggle}
        testID="business-shift-same-for-every-date"
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: schedule.draft.sameForEveryDate
                ? colors.primary
                : colors.surface,
              borderColor: schedule.draft.sameForEveryDate
                ? colors.primary
                : colors.border,
            },
          ]}
        >
          {schedule.draft.sameForEveryDate ? (
            <Text style={[styles.checkmark, { color: colors.onPrimary }]}>
              ✓
            </Text>
          ) : null}
        </View>
        <Text style={[styles.sameDatesLabel, { color: colors.text }]}>
          {t('businessShiftCreate.sameForEveryDate')}
        </Text>
      </Pressable>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.perDateSchedule')}
        </Text>
        {(schedule.draft.sameForEveryDate
          ? schedule.draft.schedules.slice(0, 1)
          : schedule.draft.schedules
        ).map(daySchedule => (
          <View
            key={daySchedule.date}
            style={[
              styles.dateSchedule,
              { backgroundColor: colors.fill },
            ]}
          >
            <Text style={[styles.selectedDate, { color: colors.text }]}>
              {schedule.draft.sameForEveryDate
                ? t('businessShiftCreate.sameDetailsForSelectedDates', {
                    count: schedule.draft.schedules.length,
                  })
                : new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: 'medium',
                  }).format(parseLocalDate(daySchedule.date))}
            </Text>
            <ShiftFormField
              label={t('businessLiveCreate.role')}
              value={daySchedule.role}
              onChangeText={role =>
                schedule.updateSchedule(daySchedule.date, { role })
              }
              placeholder={t('businessLiveCreate.rolePlaceholder')}
              maxLength={60}
              testID={`business-shift-job-title-${daySchedule.date}`}
            />
            <View style={styles.categoryField}>
              <Text style={[styles.label, { color: colors.textSubtle }]}>
                {t('businessLiveCreate.category')}
              </Text>
              <View accessibilityRole="radiogroup" style={styles.categoryOptions}>
                {BUSINESS_TYPES.map(category => {
                  const selected = daySchedule.category === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() =>
                        schedule.updateSchedule(daySchedule.date, {
                          category: category.id,
                        })
                      }
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor: selected
                            ? colors.primary
                            : colors.fill,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      testID={`business-shift-category-${daySchedule.date}-${category.id}`}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            color: selected
                              ? colors.onPrimary
                              : colors.textMuted,
                          },
                        ]}
                      >
                        {t(`businessSignup.businessTypes.${category.id}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
            <View style={styles.row}>
              <ShiftFormField
                label={t('businessShiftCreate.workers')}
                value={daySchedule.workers}
                onChangeText={workers =>
                  schedule.updateSchedule(daySchedule.date, { workers })
                }
                keyboardType="number-pad"
                testID={`business-shift-workers-${daySchedule.date}`}
              />
              <ShiftFormField
                label={t('businessLiveCreate.requirement')}
                value={daySchedule.requirement}
                onChangeText={requirement =>
                  schedule.updateSchedule(daySchedule.date, { requirement })
                }
                testID={`business-shift-requirements-${daySchedule.date}`}
              />
            </View>
            <ShiftFormField
              label={t('businessShiftCreate.responsibilities')}
              value={daySchedule.responsibilities}
              onChangeText={responsibilities =>
                schedule.updateSchedule(daySchedule.date, { responsibilities })
              }
              multiline
              textAlignVertical="top"
              style={styles.multiline}
              testID={`business-shift-responsibilities-${daySchedule.date}`}
            />
            <ShiftFormField
              label={t('businessShiftCreate.hourlyPay')}
              value={daySchedule.hourlyRate}
              onChangeText={hourlyRate =>
                schedule.updateSchedule(daySchedule.date, { hourlyRate })
              }
              keyboardType="number-pad"
              prefix="₹"
              testID={`business-shift-hourly-pay-${daySchedule.date}`}
            />
          </View>
        ))}
      </View>

    </FormScreen>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 4 },
  sameDatesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 17 },
  sameDatesLabel: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 12 },
  categoryField: { gap: 6 },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryOptionText: { fontFamily: FONTS.semiBold, fontSize: 13 },
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
