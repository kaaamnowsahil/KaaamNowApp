import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PricingModeRadio } from '@/components/taskPricing/PricingModeRadio';
import { PrimaryButton, ScreenIntro, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { tabHome } from '@/route/tabRoutes';
import { FormScreen } from '@/layout/FormScreen';
import { WorkerCountStepper } from '@/pages/liveWork/components/LiveWorkUi';
import { errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { geocodeAddress, reverseGeocode } from '@/services/maps/googleMaps';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessShiftSlot } from '@/types';

import {
  BusinessShiftCalendar,
  ShiftFieldError,
  ShiftFormField,
  ShiftLocationCard,
  ShiftSelectField,
  ShiftTimeField,
} from './components';
import { SHIFT_FORM_ERRORS } from './constants/shiftFormErrors';
import { useBusinessShiftSchedule } from './hooks';
import {
  getDurationHours,
  parseLocalDate,
  toBulkItems,
  type SlotErrors,
} from './utils';

/** Matches the server's ``workers_required`` limit for scheduled shifts. */
const MAX_SHIFT_WORKERS = 100;

const GEOCODE_DELAY_MS = 800;

export const BusinessShiftSchedulePage: FC<
  AppScreenProps<typeof ROUTES.businessShiftSchedule>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const lookups = useApiQuery(
    () => Promise.all([meApi.workCategories(), meApi.profile()]),
    [],
  );
  const categories = lookups.data?.[0] ?? [];
  const business = lookups.data?.[1].business;
  const schedule = useBusinessShiftSchedule(route.params?.draft, {
    responsibilities: '',
    role: '',
    category: '',
  });
  const { draft, dates, update } = schedule;
  const { busy, run } = useShiftAction();
  const [addressEdited, setAddressEdited] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState('');
  const prefilled = useRef(Boolean(route.params?.draft?.location));

  useEffect(() => {
    if (!business || prefilled.current) return;
    prefilled.current = true;
    update({
      location: business.address_text || business.locality || '',
      latitude: business.latitude,
      longitude: business.longitude,
    });
  }, [business, update]);

  useEffect(() => {
    const address = draft.location.trim();
    if (!addressEdited || !address) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsGeocoding(true);
      geocodeAddress(address, controller.signal)
        .then(coordinates => {
          if (coordinates) update(coordinates);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!controller.signal.aborted) setIsGeocoding(false);
        });
    }, GEOCODE_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [addressEdited, draft.location, update]);

  const formatDate = (date: string, dateStyle: 'medium' | 'full' = 'medium') =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle }).format(
      parseLocalDate(date),
    );
  const firstRole = draft.schedules[0]?.role.trim() ?? '';

  const validation = schedule.validate();
  const locationError =
    !draft.location.trim() || draft.latitude == null || draft.longitude == null
      ? SHIFT_FORM_ERRORS.LOCATION
      : undefined;

  /** Errors for the n-th slot of a date; with "same for every date" any date's copy counts. */
  const errorsFor = (slot: BusinessShiftSlot, index: number): SlotErrors => {
    if (!showErrors) return {};
    if (!draft.sameForEveryDate) return validation.slots[slot.id ?? ''] ?? {};
    return dates.reduce<SlotErrors>((merged, date) => {
      const copy = draft.schedules.filter(item => item.date === date)[index];
      return { ...(copy ? validation.slots[copy.id ?? ''] : {}), ...merged };
    }, {});
  };

  const review = () => {
    setShowErrors(true);
    if (validation.hasErrors || locationError) return;
    navigation.navigate(ROUTES.businessShiftReview, {
      draft: schedule.trimmed(),
    });
  };

  const save = () => {
    setShowErrors(true);
    if (validation.hasErrors) return;
    setSaveError('');
    run(
      () =>
        shiftsApi.createBulk({
          publish: false,
          shifts: toBulkItems(schedule.trimmed()),
        }),
      () =>
        navigation.navigate(ROUTES.mainTabs, tabHome(ROUTES.businessShifts)),
      undefined,
      error => {
        setSaveError(errorMessage(error));
        return true;
      },
    );
  };

  const renderSlot = (slot: BusinessShiftSlot, index: number, count: number) => {
    const id = slot.id ?? '';
    const set = (changes: Partial<BusinessShiftSlot>) =>
      schedule.updateSchedule(id, changes);
    const isTask = slot.pricingMode === 'task';
    const hours = isTask
      ? 0
      : Number(getDurationHours(slot.startTime, slot.endTime).toFixed(2));
    const errors = errorsFor(slot, index);
    return (
      <View
        key={id}
        style={[styles.slot, { borderColor: colors.border }]}
        testID={`business-shift-slot-${id}`}
      >
        <Text
          style={[
            styles.slotTitle,
            { color: colors.textMuted, backgroundColor: colors.background },
          ]}
        >
          {t('businessShiftCreate.shiftNumber', { count: index + 1 })}
        </Text>
        {count > 1 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => schedule.removeShift(id)}
            style={[
              styles.slotButton,
              styles.remove,
              { borderColor: colors.border, backgroundColor: colors.background },
            ]}
            testID={`business-shift-remove-${id}`}
          >
            <Text style={[styles.slotButtonLabel, { color: colors.danger }]}>
              {t('businessShiftCreate.removeShift')}
            </Text>
          </Pressable>
        ) : null}
        <ShiftFormField
          label={t('businessLiveCreate.role')}
          value={slot.role}
          onChangeText={role => set({ role })}
          placeholder={t('businessLiveCreate.rolePlaceholder')}
          maxLength={60}
          error={errors.role}
          testID={`business-shift-job-title-${id}`}
        />
        <ShiftSelectField
          label={t('businessLiveCreate.category')}
          value={slot.category}
          placeholder={t('businessLiveCreate.categoryPlaceholder')}
          options={categories}
          onChange={category => set({ category })}
          error={errors.category}
          testID={`business-shift-category-${id}`}
        />
        <PricingModeRadio
          value={slot.pricingMode ?? 'hourly'}
          onChange={pricingMode => set({ pricingMode })}
          testID={`business-shift-pricing-${id}`}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <ShiftTimeField
              label={t('businessShiftCreate.start')}
              value={slot.startTime}
              placeholder={t('businessShiftCreate.timePlaceholder')}
              onChange={startTime => set({ startTime })}
              error={errors.startTime}
              testID={`business-shift-start-${id}`}
            />
          </View>
          {isTask ? (
            <View style={styles.halfSpacer} />
          ) : (
            <View style={styles.half}>
              <ShiftTimeField
                label={t('businessShiftCreate.end')}
                value={slot.endTime}
                placeholder={t('businessShiftCreate.timePlaceholder')}
                onChange={endTime => set({ endTime })}
                error={errors.endTime}
                testID={`business-shift-end-${id}`}
              />
            </View>
          )}
        </View>
        {hours > 0 ? (
          <Text style={[styles.note, { color: colors.textSubtle }]}>
            {t('businessShiftCreate.hoursDuration', { hours })}
          </Text>
        ) : null}
        <WorkerCountStepper
          value={Math.max(Number(slot.workers) || 1, 1)}
          max={MAX_SHIFT_WORKERS}
          error={errors.workers}
          hint={null}
          testID={`business-shift-workers-${id}`}
          onChange={workers => set({ workers: String(workers) })}
        />
        <View style={styles.row}>
          {isTask ? (
            <ShiftFormField
              label={t('taskPricing.taskPriceLabel')}
              value={slot.taskPrice ?? ''}
              onChangeText={taskPrice => set({ taskPrice })}
              keyboardType="number-pad"
              placeholder={t('taskPricing.taskPricePlaceholder')}
              error={errors.taskPrice}
              testID={`business-shift-task-price-${id}`}
            />
          ) : (
            <ShiftFormField
              label={t('businessShiftCreate.hourlyPay')}
              value={slot.hourlyRate}
              onChangeText={hourlyRate => set({ hourlyRate })}
              keyboardType="number-pad"
              placeholder={t('businessShiftCreate.hourlyPayPlaceholder')}
              error={errors.hourlyRate}
              testID={`business-shift-hourly-pay-${id}`}
            />
          )}
        </View>
        {isTask ? (
          <Text style={[styles.note, { color: colors.textSubtle }]}>
            {t('taskPricing.taskNote')}
          </Text>
        ) : (
          <View style={styles.row}>
            <ShiftFormField
              label={t('businessShiftCreate.breakMinutes')}
              value={slot.breakMinutes ?? ''}
              onChangeText={breakMinutes => set({ breakMinutes })}
              keyboardType="number-pad"
              placeholder={t('businessShiftCreate.breakMinutesPlaceholder')}
              error={errors.breakMinutes}
              testID={`business-shift-break-${id}`}
            />
            <View style={styles.halfSpacer} />
          </View>
        )}
        <ShiftFormField
          label={t('businessShiftCreate.responsibilities')}
          value={slot.responsibilities}
          onChangeText={responsibilities => set({ responsibilities })}
          placeholder={t('businessShiftCreate.responsibilitiesPlaceholder')}
          multiline
          textAlignVertical="top"
          style={styles.multiline}
          error={errors.responsibilities}
          testID={`business-shift-responsibilities-${id}`}
        />
      </View>
    );
  };

  const renderDateGroup = (date: string) => {
    const slots = draft.schedules.filter(slot => slot.date === date);
    return (
      <View key={date} style={styles.dateGroup}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>
          {draft.sameForEveryDate
            ? t('businessShiftCreate.sameShiftsForSelectedDates', {
                count: dates.length,
              })
            : formatDate(date, 'full')}
        </Text>
        {slots.map((slot, index) => renderSlot(slot, index, slots.length))}
        <Pressable
          accessibilityRole="button"
          onPress={() => schedule.addShift(date)}
          style={[
            styles.slotButton,
            { borderColor: colors.primary, backgroundColor: colors.background },
          ]}
          testID={`business-shift-add-${date}`}
        >
          <Text style={[styles.slotButtonLabel, { color: colors.primary }]}>
            +  {t('businessShiftCreate.addAnotherShift')}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <FormScreen
      busy={busy}
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessDashboard.scheduledStatus')}
      headerTag={t('businessApplicants.headerTag')}
      gap={12}
      isLoading={lookups.isLoading}
      testID="business-shift-schedule-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessShiftCreate.review')}
            onPress={review}
            disabled={busy}
            testID="business-shift-review"
          />
          <SecondaryButton
            label={t('businessShiftCreate.saveDraft')}
            onPress={save}
            disabled={busy}
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
          subtitle={[firstRole, draft.location.trim()].filter(Boolean).join(' · ')}
        />
        <ShiftFieldError message={saveError} />
      </View>

      <ShiftLocationCard
        address={draft.location}
        latitude={draft.latitude}
        longitude={draft.longitude}
        isGeocoding={isGeocoding}
        error={showErrors ? locationError : undefined}
        onAddressChange={location => {
          setAddressEdited(true);
          update({ location, latitude: null, longitude: null });
        }}
        onMapPick={(latitude, longitude) => {
          setAddressEdited(false);
          update({ latitude, longitude });
          setIsGeocoding(true);
          reverseGeocode({ latitude, longitude })
            .then(address => {
              if (address) update({ location: address });
            })
            .catch(() => undefined)
            .finally(() => setIsGeocoding(false));
        }}
        onPicked={picked => {
          setAddressEdited(false);
          update({
            location: picked.address,
            latitude: picked.lat,
            longitude: picked.lng,
          });
        }}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.date')}
        </Text>
        <Text style={[styles.selectedDate, { color: colors.text }]}>
          {t('businessShiftCreate.selectedDates', { count: dates.length })}
        </Text>
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.selectMultipleDates')}
        </Text>
        <BusinessShiftCalendar value={dates} onChange={schedule.updateDates} />
        <ShiftFieldError message={showErrors ? validation.dates : undefined} />
        {dates.length > 0 ? (
          <Text style={[styles.note, { color: colors.textSubtle }]}>
            {dates.map(date => formatDate(date)).join(' · ')}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: Boolean(draft.sameForEveryDate) }}
        onPress={() => schedule.setSameForEveryDate(!draft.sameForEveryDate)}
        style={styles.sameDatesToggle}
        testID="business-shift-same-for-every-date"
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: draft.sameForEveryDate ? colors.primary : colors.surface,
              borderColor: draft.sameForEveryDate ? colors.primary : colors.border,
            },
          ]}
        >
          {draft.sameForEveryDate ? (
            <Text style={[styles.checkmark, { color: colors.onPrimary }]}>✓</Text>
          ) : null}
        </View>
        <Text style={[styles.sameDatesLabel, { color: colors.text }]}>
          {t('businessShiftCreate.sameShiftsForEveryDate')}
        </Text>
      </Pressable>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.perDateSchedule')}
        </Text>
        {(draft.sameForEveryDate ? dates.slice(0, 1) : dates).map(renderDateGroup)}
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
  halfSpacer: { flex: 1 },
  half: { flex: 1 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  field: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  selectedDate: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  note: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 8 },
  dateGroup: { gap: 8 },
  groupTitle: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  slot: {
    gap: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    paddingTop: 18,
    marginTop: 8,
  },
  slotTitle: {
    position: 'absolute',
    top: -9,
    left: 10,
    paddingHorizontal: 4,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  slotButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  slotButtonLabel: { fontFamily: FONTS.regular, fontSize: 13 },
  remove: { alignSelf: 'flex-end' },
  multiline: { minHeight: 72, paddingTop: 10 },
});
