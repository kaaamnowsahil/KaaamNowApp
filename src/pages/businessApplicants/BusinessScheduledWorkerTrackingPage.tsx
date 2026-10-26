import { useEffect, useState, type FC } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import PhoneIcon from '@/assets/figma/phone.svg';
import {
  FlowHeading,
  InfoCallout,
  MapPreview,
  PinSheet,
  ReasonSheet,
  StatTiles,
} from '@/components/shiftFlow';
import {
  BottomSheet,
  ChipGroup,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessApplicantStore } from '@/pages/businessApplicants/store/useBusinessApplicantStore';
import {
  formatDateLabel,
  formatTime,
  formatTimeRange,
  fromMinor,
} from '@/services/shifts/shiftMappers';
import { shiftsApi, type AssignmentDetail, type CancellationQuote } from '@/services/shifts/shiftsApi';
import { useAssignment, useShiftAction } from '@/services/shifts/useShiftFlow';
import { useEmergency } from '@/services/support/useEmergency';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import {
  BOOKING_DETAIL_STRINGS as S,
  BUSINESS_CANCEL_REASONS,
  EXTEND_OPTIONS,
  STOP_REASONS,
} from './constants/bookingDetailStrings';

const POLL_MS = 20000;
type Sheet = 'pin' | 'extend' | 'stop' | null;

/**
 * Business view of one booked seat (not in Figma): check-in code, travel,
 * end / early-end PIN, extensions, stop work, cancel with fee preview.
 * - data: GET /assignments/{id} (polled), GET /assignments/{id}/tracking
 */
export const BusinessScheduledWorkerTrackingPage: FC<
  AppScreenProps<typeof ROUTES.businessScheduledWorkerTracking>
> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { assignmentId } = route.params;
  const assignment = useAssignment(assignmentId);
  const { setData } = assignment;
  const detail = assignment.data;
  const status = detail?.status ?? '';
  const action = useShiftAction();
  const emergency = useEmergency(assignmentId);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [extendBy, setExtendBy] = useState('60');
  const [cancelQuote, setCancelQuote] = useState<CancellationQuote | null>(null);
  const upsert = useBusinessApplicantStore(state => state.upsert);
  const tracking = useApiQuery(
    async () => (status === 'en_route' ? shiftsApi.tracking(assignmentId) : null),
    [assignmentId, status],
  );

  const contact = useApiQuery(() => shiftsApi.contact(assignmentId), [assignmentId]);
  const phone = contact.data?.phone;

  useEffect(() => {
    const id = setInterval(() => {
      shiftsApi.assignment(assignmentId).then(setData).catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [assignmentId, setData]);

  useEffect(() => {
    if (!detail) return;
    upsert([
      {
        id: assignmentId,
        name: detail.worker.full_name,
        experience: '',
        experienceMonths: detail.worker.completed_shift_count,
        category: detail.shift.job_title,
        rating: detail.worker.rating_avg,
        status: 'confirmed',
        location: '',
        about: '',
        skills: [],
        assignmentId,
      },
    ]);
  }, [assignmentId, detail, upsert]);

  const update = (next: AssignmentDetail) => {
    setSheet(null);
    setData(next);
  };
  const run = <T,>(call: () => Promise<T>, onDone: (result: T) => void) =>
    action.run(call, onDone, S.ACTION_FAILED);

  const endShift = () => run(() => shiftsApi.businessEnd(assignmentId), update);
  const startEarlyEnd = () =>
    run(
      () => shiftsApi.requestEarlyEnd('business', assignmentId),
      next => {
        setData(next);
        setSheet('pin');
      },
    );
  const endEarly = (pin: string) =>
    run(() => shiftsApi.endEarly('business', assignmentId, pin), update);
  const extend = () =>
    run(
      () => shiftsApi.requestExtension(assignmentId, Number(extendBy)),
      () => {
        setSheet(null);
        assignment.reload();
      },
    );
  const stop = (reason: string) =>
    run(
      () => shiftsApi.stopWork(assignmentId, reason as 'business_stopped' | 'worker_left'),
      update,
    );
  const openCancel = () => run(() => shiftsApi.businessCancelPreview(assignmentId), setCancelQuote);
  const cancel = (reasonId: string) => {
    const reason = BUSINESS_CANCEL_REASONS.find(item => item.id === reasonId)?.label ?? reasonId;
    setCancelQuote(null);
    run(
      () => shiftsApi.businessCancelAssignment(assignmentId, reason),
      () => assignment.reload(),
    );
  };

  const isBooked = status === 'confirmed' || status === 'en_route';
  const isWorking = status === 'checked_in';
  const isEnded = status === 'checked_out' || status === 'approved';
  const pinForWorker =
    detail?.early_end_requested_by === 'worker' ? detail.early_end_pin : null;
  const pending = detail?.pending_extension;
  const shift = detail?.shift;

  const actions = (() => {
    if (isBooked) {
      return (
        <SecondaryButton
          label={S.CANCEL}
          tone="danger"
          disabled={action.busy}
          onPress={openCancel}
          testID="booking-cancel"
        />
      );
    }
    if (isWorking) {
      return (
        <>
          <PrimaryButton
            label={detail?.can_end ? S.END_SHIFT : S.END_EARLY}
            disabled={action.busy}
            onPress={detail?.can_end ? endShift : startEarlyEnd}
            testID="booking-end"
          />
          <SecondaryButton
            label={S.EXTEND}
            disabled={action.busy || Boolean(pending)}
            onPress={() => setSheet('extend')}
            testID="booking-extend"
          />
          <SecondaryButton label={S.STOP} tone="danger" onPress={() => setSheet('stop')} />
        </>
      );
    }
    if (isEnded && detail?.can_rate) {
      return (
        <PrimaryButton
          label={S.RATE}
          onPress={() =>
            navigation.navigate(ROUTES.businessRateWorker, {
              workerId: assignmentId,
              role: shift?.job_title ?? '',
              business: shift?.business.business_name ?? '',
            })
          }
          testID="booking-rate"
        />
      );
    }
    return null;
  })();

  return (
    <>
      <FormScreen
        busy={action.busy || emergency.busy}
        onBack={navigation.goBack}
        title={S.status[status] ?? S.TITLE}
        compactTitle
        gap={12}
        isLoading={assignment.isLoading}
        testID="business-scheduled-worker-tracking-page"
        actions={
          <>
            {actions}
            {isBooked || isWorking ? (
              <SecondaryButton
                label={S.EMERGENCY}
                tone="danger"
                disabled={emergency.busy}
                onPress={emergency.trigger}
                testID="booking-emergency"
              />
            ) : null}
          </>
        }
      >
        <FlowHeading
          title={detail?.worker.full_name ?? ''}
          subtitle={
            shift
              ? S.when(
                formatDateLabel(shift.starts_at),
                formatTimeRange(shift.starts_at, shift.ends_at),
              )
              : undefined
          }
        />

        {isBooked && detail?.check_in_code ? (
          <View style={[styles.codeCard, { backgroundColor: colors.fill }]}>
            <Text style={[styles.codeLabel, { color: colors.textSubtle }]}>{S.CODE_LABEL}</Text>
            <Text style={[styles.code, { color: colors.text }]} testID="booking-check-in-code">
              {detail.check_in_code}
            </Text>
            <Text style={[styles.codeLabel, { color: colors.textSubtle }]}>{S.CODE_HINT}</Text>
          </View>
        ) : null}

        {status === 'en_route' ? (
          <MapPreview
            variant="pin"
            label={S.onTheWay(tracking.data?.distance_km, tracking.data?.eta_minutes)}
          />
        ) : null}

        {pinForWorker ? <InfoCallout text={S.pinForWorker(pinForWorker)} /> : null}
        {pending ? <InfoCallout text={S.extensionPending(pending.extra_minutes)} /> : null}

        {detail && (isWorking || isEnded) ? (
          <StatTiles
            items={[
              {
                value: detail.attendance?.checked_in_at
                  ? formatTime(detail.attendance.checked_in_at)
                  : '—',
                label: S.CHECKED_IN_AT,
              },
              {
                value: formatTime(detail.ends_at),
                label: detail.extended_minutes
                  ? S.extendedBy(detail.extended_minutes)
                  : S.ENDS_AT,
              },
            ]}
          />
        ) : null}

        {shift ? (
          <View style={[styles.summary, { backgroundColor: colors.fill }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>{shift.job_title}</Text>
            <Text style={[styles.meta, { color: colors.textSubtle }]}>
              {`${formatRupees(fromMinor(detail.hourly_rate_minor))}/hr · ${shift.workplace_name || shift.address_text}`}
            </Text>
            {phone ? (
              <View style={styles.callButton}>
                <SecondaryButton
                  label={S.call(phone)}
                  icon={PhoneIcon}
                  onPress={() => Linking.openURL(`tel:${phone}`)}
                  testID="booking-call-worker"
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </FormScreen>

      {sheet === 'pin' ? (
        <PinSheet
          title={S.PIN_TITLE}
          subtitle={S.PIN_BODY}
          confirmLabel={S.PIN_CONFIRM}
          closeLabel={S.PIN_CLOSE}
          busy={action.busy}
          onSubmit={endEarly}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === 'extend' ? (
        <BottomSheet
          title={S.EXTEND_TITLE}
          subtitle={S.EXTEND_BODY}
          onClose={() => setSheet(null)}
          closeLabel={S.EXTEND_CLOSE}
        >
          <View style={styles.sheetBody}>
            <ChipGroup
              label={S.EXTEND_LABEL}
              options={EXTEND_OPTIONS}
              selected={[extendBy]}
              onToggle={setExtendBy}
            />
            <PrimaryButton
              label={S.EXTEND_CONFIRM}
              disabled={action.busy}
              onPress={extend}
              testID="booking-extend-confirm"
            />
          </View>
        </BottomSheet>
      ) : null}
      {sheet === 'stop' ? (
        <ReasonSheet
          title={S.STOP_TITLE}
          subtitle={S.STOP_BODY}
          reasonLabel={S.STOP_LABEL}
          reasons={STOP_REASONS}
          confirmLabel={S.STOP_CONFIRM}
          keepLabel={S.STOP_KEEP}
          onConfirm={stop}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {cancelQuote ? (
        <ReasonSheet
          title={S.CANCEL_TITLE}
          subtitle={
            cancelQuote.fee_minor > 0
              ? S.feeCancel(formatRupees(fromMinor(cancelQuote.fee_minor)))
              : S.FREE_CANCEL
          }
          reasonLabel={S.CANCEL_LABEL}
          reasons={BUSINESS_CANCEL_REASONS}
          confirmLabel={S.CANCEL_CONFIRM}
          keepLabel={S.CANCEL_KEEP}
          onConfirm={cancel}
          onClose={() => setCancelQuote(null)}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  codeCard: { borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  codeLabel: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  code: {
    fontFamily: FONTS.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
  },
  summary: { borderRadius: 14, padding: 12, gap: 4 },
  callButton: { marginTop: 8 },
  summaryTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  sheetBody: { gap: 16, marginTop: 8 },
});
