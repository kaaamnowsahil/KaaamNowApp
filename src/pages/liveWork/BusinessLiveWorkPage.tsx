import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  BottomSheet,
  ChipGroup,
  PrimaryButton,
  SecondaryButton,
  TextField,
} from '@/components/ui';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import XIcon from '@/assets/figma/x.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import { CompletionCodeCard } from '@/components/taskPricing/CompletionCode';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { payInvoice } from '@/services/billing/billingApi';
import { tr } from '@/services/i18n/tr';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import {
  EXTENSION_MINUTE_OPTIONS,
  formatClock,
  formatMinutes,
  formatRupees,
  liveErrorText,
  LIVE_POLL_MS,
} from '@/services/liveWork/liveWorkFormat';
import {
  BUSINESS_LIVE_STATUS,
  LIVE_TEXT as S,
} from '@/services/liveWork/liveWorkStrings';
import type {
  BusinessLiveBooking,
  LiveCancelPreview,
  LiveExtensionQuote,
} from '@/services/liveWork/liveWorkTypes';
import {
  useCountdown,
  useLivePolling,
} from '@/services/liveWork/useLivePolling';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import {
  LiveCard,
  LiveExtensionBreakdown,
  LivePriceBreakdownCard,
  LiveText,
} from './components/LiveWorkUi';
import { LiveSearchMap } from './components/LiveSearchMap';
import { LiveRulesCard } from './components/LiveRulesCard';
import { LiveSeatCard } from './components/LiveSeatCard';

const EXTENSION_OPTIONS = EXTENSION_MINUTE_OPTIONS.map(minutes => ({
  id: String(minutes),
  label: `+${formatMinutes(minutes)}`,
}));
const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

/** Business view of one Live Work booking; every value shown comes from the server. */
export const BusinessLiveWorkPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveWork>
> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { bookingId } = route.params;
  const load = useCallback(() => liveWorkApi.get(bookingId), [bookingId]);
  const {
    data: booking,
    setData,
    error: loadError,
    offline,
    refresh,
  } = useLivePolling<BusinessLiveBooking>(load, LIVE_POLL_MS);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<
    'cancel' | 'cancelWorker' | 'extend' | null
  >(null);
  /** The Worker a sheet acts on; undefined = the booking's first Worker. */
  const [seatId, setSeatId] = useState<string | undefined>(undefined);
  const [sheetError, setSheetError] = useState('');
  const [cancelPreview, setCancelPreview] = useState<LiveCancelPreview | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState('');
  const [extendBy, setExtendBy] = useState(60);
  const [extQuote, setExtQuote] = useState<LiveExtensionQuote | null>(null);

  const searchLeft = useCountdown(
    booking?.status === 'searching' ? booking.search?.expires_at : null,
    booking?.server_time,
  );
  const workLeft = useCountdown(
    booking?.status === 'in_progress' ? booking.timer?.ends_at : null,
    booking?.server_time,
  );

  const run = async (
    call: () => Promise<BusinessLiveBooking | null | void>,
    inSheet = false,
  ) => {
    setBusy(true);
    setSheetError('');
    try {
      const next = await call();
      if (next) setData(next);
      else await refresh();
      return true;
    } catch (error) {
      if (inSheet) setSheetError(liveErrorText(error));
      else Alert.alert(S.actionFailed, liveErrorText(error));
      await refresh();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const pay = (invoiceId: string) =>
    run(async () => {
      await payInvoice(invoiceId);
    });

  const openCancel = () =>
    run(async () => {
      setCancelPreview(await liveWorkApi.cancelPreview(bookingId));
      setCancelReason('');
      setSeatId(undefined);
      setSheet('cancel');
    });

  const openCancelWorker = (assignmentId: string) =>
    run(async () => {
      setCancelPreview(
        await liveWorkApi.cancelWorkerPreview(bookingId, assignmentId),
      );
      setCancelReason('');
      setSeatId(assignmentId);
      setSheet('cancelWorker');
    });

  const loadExtQuote = async (minutes: number, assignmentId = seatId) => {
    setExtendBy(minutes);
    setExtQuote(null);
    setSheetError('');
    try {
      setExtQuote(
        await liveWorkApi.extensionQuote(bookingId, minutes, assignmentId),
      );
    } catch (error) {
      setSheetError(liveErrorText(error));
    }
  };

  const openExtend = (assignmentId?: string) => {
    setSeatId(assignmentId);
    setSheet('extend');
    loadExtQuote(extendBy, assignmentId);
  };

  const isTask = booking?.work.pricing_mode === 'task';

  if (!booking) {
    return (
      <FormScreen
        title={S.trackTitle}
        headerTag={S.modeTag}
        isLoading={!loadError && !offline}
      >
        <LiveText tone="danger">{loadError || S.offline}</LiveText>
        <SecondaryButton label={S.retry} onPress={() => refresh()} />
      </FormScreen>
    );
  }

  const { actions, assignment, work, status } = booking;
  const openExt = booking.extensions.find(
    e => e.status === 'requested' || e.status === 'awaiting_payment',
  );
  const lastExt = booking.extensions[booking.extensions.length - 1];
  const beforeStart = status === 'assigned' || status === 'en_route';
  const workersRequired = booking.workers_required ?? 1;
  const multi = workersRequired > 1;
  const unfilledRefund = booking.unfilled_refund_minor ?? 0;
  const working =
    status === 'in_progress' &&
    (!multi ||
      (booking.workers ?? []).some(
        seat => seat.assignment.status === 'checked_in',
      ));
  const forceCancel = cancelPreview?.stage === 'during_work';

  return (
    <FormScreen
      title={S.trackTitle}
      subtitle={BUSINESS_LIVE_STATUS[status] ?? status}
      headerTag={S.modeTag}
      gap={14}
      busy={busy}
      testID="business-live-work-page"
      actions={
        <>
          {actions.can_pay && booking.deposit_invoice ? (
            <PrimaryButton
              label={S.payNow(
                formatRupees(
                  booking.deposit_invoice.amount_due_minor ||
                    booking.deposit_invoice.total_minor,
                ),
              )}
              onPress={() => pay(booking.deposit_invoice!.id)}
              disabled={busy}
              testID="business-live-work-pay"
            />
          ) : null}
          {openExt?.status === 'awaiting_payment' && openExt.invoice_id ? (
            <PrimaryButton
              label={S.payNow(formatRupees(openExt.total_minor))}
              onPress={() => pay(openExt.invoice_id!)}
              disabled={busy}
            />
          ) : null}
          {!multi && actions.can_extend && !openExt ? (
            <SecondaryButton
              label={S.extend}
              icon={ClockIcon}
              onPress={() => openExtend()}
              disabled={busy}
            />
          ) : null}
          {unfilledRefund > 0 && status !== 'cancelled' ? (
            <SecondaryButton
              label={S.postRest}
              onPress={() => navigation.navigate(ROUTES.businessShiftSchedule)}
              disabled={busy}
              testID="business-live-work-post-rest"
            />
          ) : null}
          {actions.can_repost ? (
            <PrimaryButton
              label={S.repost}
              onPress={() =>
                navigation.replace(ROUTES.businessLiveWorkPost, {
                  repost: { work, workers: workersRequired },
                })
              }
            />
          ) : null}
          {actions.can_cancel ? (
            <SecondaryButton
              label={working ? S.forceCancel : S.cancel}
              tone="danger"
              icon={XIcon}
              onPress={() => openCancel()}
              disabled={busy}
            />
          ) : null}
        </>
      }
    >
      <View style={styles.stack}>
        <LiveText tone="title">{work.job_title}</LiveText>
        <LiveText tone="muted">
          {isTask
            ? `${work.category_name ?? ''} · ${tr(
                'taskPricing.fixedPriceAmount',
                { amount: formatRupees(work.task_price_minor ?? 0) },
              )}`
            : `${work.category_name ?? ''} · ${formatMinutes(
                work.reserved_minutes,
              )} · ${formatRupees(work.hourly_rate_minor)}/h`}
        </LiveText>
        <View style={styles.address}>
          <MapPinIcon width={16} height={16} color={colors.textMuted} />
          <View style={styles.addressText}>
            <LiveText tone="muted">{work.address_text}</LiveText>
          </View>
        </View>
      </View>

      {offline ? <LiveText tone="muted">{S.offline}</LiveText> : null}
      {loadError ? <LiveText tone="danger">{loadError}</LiveText> : null}
      {status === 'awaiting_payment' ? (
        <LiveCard>
          <LiveText>{S.payPending}</LiveText>
        </LiveCard>
      ) : null}

      {status === 'searching' && booking.search ? (
        <LiveCard testID="business-live-work-searching">
          {work.latitude != null && work.longitude != null ? (
            <LiveSearchMap
              latitude={work.latitude}
              longitude={work.longitude}
              category={work.category_slug}
              label={S.searching}
              timerLabel={S.searchTimeLeft(formatClock(searchLeft))}
            />
          ) : null}
          <LiveText>{S.searching}</LiveText>
          <LiveText tone="strong">
            {S.searchTimeLeft(formatClock(searchLeft))}
          </LiveText>
          <LiveText tone="muted">
            {`${S.notified(
              booking.search.notified_workers,
            )} · ${S.availableWorkers(
              booking.search.available_workers,
              booking.search.radius_km ?? 0,
            )}`}
          </LiveText>
        </LiveCard>
      ) : null}
      {status === 'no_workers' ? (
        <LiveCard>
          <LiveText>{S.noWorkers}</LiveText>
        </LiveCard>
      ) : null}

      {multi && status !== 'awaiting_payment' ? (
        <LiveCard testID="business-live-work-workers-found">
          <LiveText tone="strong">
            {S.workersFound(booking.workers_filled ?? 0, workersRequired)}
          </LiveText>
          {unfilledRefund > 0 ? (
            <LiveText>
              {S.unfilledRefunded(formatRupees(unfilledRefund))}
            </LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      {multi && status !== 'cancelled'
        ? (booking.workers ?? []).map((seat, index) => (
            <LiveSeatCard
              key={seat.assignment.assignment_id}
              seat={seat}
              index={index}
              isTask={isTask}
              busy={busy}
              serverTime={booking.server_time}
              onReissueCode={() =>
                run(() =>
                  liveWorkApi.reissueCode(
                    bookingId,
                    seat.assignment.assignment_id,
                  ),
                )
              }
              onReissueCompletion={() =>
                run(() =>
                  liveWorkApi.reissueCompletionCode(
                    bookingId,
                    seat.assignment.assignment_id,
                  ),
                )
              }
              onExtend={() => openExtend(seat.assignment.assignment_id)}
              onCancel={() => openCancelWorker(seat.assignment.assignment_id)}
            />
          ))
        : null}

      {!multi && assignment && status !== 'cancelled' ? (
        <LiveCard testID="business-live-work-worker">
          <LiveText tone="label">{S.workerProfile}</LiveText>
          <LiveText tone="strong">
            {`${assignment.worker.full_name ?? 'Worker'}${
              assignment.worker.verification_status === 'verified' ? ' ✓' : ''
            }`}
          </LiveText>
          <LiveText tone="muted">
            {`${S.rating(
              assignment.worker.rating_avg,
              assignment.worker.rating_count,
            )} · ${S.completedJobs(assignment.worker.completed_shift_count)}`}
          </LiveText>
          {beforeStart ? (
            <LiveText>
              {assignment.location_status === 'live' && assignment.location
                ? `${S.distance(
                    assignment.location.distance_km,
                  )} · ${S.locationAge(assignment.location.age_seconds)}`
                : assignment.location_status === 'stale'
                ? S.locationStale
                : S.locationUnavailable}
            </LiveText>
          ) : null}
          {assignment.ended_reason === 'worker_left' ? (
            <LiveText>{S.workerLeft}</LiveText>
          ) : null}
          {assignment.ended_reason === 'business_stopped' ? (
            <LiveText>{S.businessStopped}</LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      {!multi && booking.arrival_code && beforeStart ? (
        <LiveCard testID="business-live-work-code">
          <LiveText tone="label">{S.arrivalCodeTitle}</LiveText>
          {booking.arrival_code.locked ? (
            <LiveText>{S.arrivalCodeLocked}</LiveText>
          ) : booking.arrival_code.expired ? (
            <LiveText>{S.arrivalCodeExpired}</LiveText>
          ) : (
            <>
              <Text selectable style={[styles.code, { color: colors.text }]}>
                {booking.arrival_code.code}
              </Text>
              <LiveText tone="muted">{S.arrivalCodeHint}</LiveText>
            </>
          )}
          {actions.can_reissue_code &&
          (booking.arrival_code.locked || booking.arrival_code.expired) ? (
            <SecondaryButton
              label={S.reissueCode}
              onPress={() => run(() => liveWorkApi.reissueCode(bookingId))}
              disabled={busy}
            />
          ) : null}
        </LiveCard>
      ) : null}

      {!multi && status === 'in_progress' ? (
        <CompletionCodeCard
          completion={booking.completion_code}
          busy={busy}
          onReissue={
            actions.can_reissue_completion_code
              ? () => run(() => liveWorkApi.reissueCompletionCode(bookingId))
              : undefined
          }
          testID="business-live-work-completion-code"
        />
      ) : null}
      {!multi && status === 'in_progress' ? (
        <LiveText tone="muted">
          {isTask ? S.doneHintTask : S.doneHintHourly}
        </LiveText>
      ) : null}

      {!multi && status === 'in_progress' && booking.timer && !isTask ? (
        <LiveCard>
          <LiveText tone="label">{S.timeLeft}</LiveText>
          <Text style={[styles.code, { color: colors.text }]}>
            {formatClock(workLeft)}
          </Text>
          {booking.timer.ends_at ? (
            <LiveText tone="muted">
              {formatTime(booking.timer.ends_at)}
            </LiveText>
          ) : null}
          {booking.timer.extended_minutes ? (
            <LiveText tone="muted">
              {S.extendedBy(booking.timer.extended_minutes)}
            </LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      {openExt?.status === 'requested' ? (
        <LiveCard>
          <LiveText>{S.extensionRequested(openExt.extra_minutes)}</LiveText>
          <SecondaryButton
            label={S.withdrawExtension}
            onPress={() =>
              run(() => liveWorkApi.cancelExtension(bookingId, openExt.id))
            }
            disabled={busy}
          />
        </LiveCard>
      ) : null}
      {openExt?.status === 'awaiting_payment' ? (
        <LiveCard>
          <LiveText>
            {S.extensionAccepted(
              openExt.extra_minutes,
              formatRupees(openExt.total_minor),
            )}
          </LiveText>
        </LiveCard>
      ) : null}
      {!openExt &&
      lastExt?.status === 'declined' &&
      status === 'in_progress' ? (
        <LiveText tone="muted">{S.extensionDeclined}</LiveText>
      ) : null}

      {booking.cancellation ? (
        <LiveCard>
          <LiveText tone="label">
            {S.cancelledBy[booking.cancellation.cancelled_by ?? 'system'] ??
              BUSINESS_LIVE_STATUS.cancelled}
          </LiveText>
          {booking.cancellation.reason ? (
            <LiveText>{booking.cancellation.reason}</LiveText>
          ) : null}
          {booking.cancellation.fee_minor > 0 ? (
            <LiveText>
              {S.feeLine(formatRupees(booking.cancellation.fee_minor))}
            </LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      {!multi && booking.final_invoice ? (
        <LiveCard>
          <LiveText tone="label">{S.finalBill}</LiveText>
          <LiveText tone="strong">
            {`${formatRupees(booking.final_invoice.total_minor)} · ${
              booking.final_invoice.status === 'paid'
                ? S.paid
                : booking.final_invoice.status
            }`}
          </LiveText>
        </LiveCard>
      ) : null}

      {booking.refunds.length ? (
        <LiveCard>
          <LiveText tone="label">{S.refunds}</LiveText>
          {booking.refunds.map(refund => (
            <LiveText key={refund.id}>
              {`${formatRupees(refund.amount_minor)} · ${
                S.refundStatus[refund.status] ?? refund.status
              }${
                S.refundReason[refund.reason]
                  ? ` · ${S.refundReason[refund.reason]}`
                  : ''
              }`}
            </LiveText>
          ))}
        </LiveCard>
      ) : null}

      <LivePriceBreakdownCard price={booking.pricing} />
      <LiveRulesCard
        audience="business"
        isTask={isTask}
        onReadTerms={() => navigation.navigate(ROUTES.terms)}
      />

      {(sheet === 'cancel' || sheet === 'cancelWorker') && cancelPreview ? (
        <BottomSheet
          title={
            forceCancel
              ? S.forceCancelTitle
              : sheet === 'cancelWorker'
              ? S.cancelWorkerTitle
              : S.cancelTitle
          }
          subtitle={S.cancelStage[cancelPreview.stage] ?? cancelPreview.effect}
          onClose={() => setSheet(null)}
          closeLabel={S.keep}
        >
          <View style={styles.stack}>
            {cancelPreview.fee_minor > 0 ? (
              <LiveText>
                {S.feeLine(formatRupees(cancelPreview.fee_minor))}
              </LiveText>
            ) : null}
            {cancelPreview.business_retained_minor > 0 ? (
              <LiveText>
                {S.retainedLine(
                  formatRupees(cancelPreview.business_retained_minor),
                )}
              </LiveText>
            ) : null}
            {cancelPreview.worker_compensation_minor > 0 ? (
              <LiveText>
                {S.workerCompLine(
                  formatRupees(cancelPreview.worker_compensation_minor),
                )}
              </LiveText>
            ) : null}
            <LiveText tone="strong">
              {S.refundLine(formatRupees(cancelPreview.business_refund_minor))}
            </LiveText>
            <TextField
              label={S.cancelReason}
              value={cancelReason}
              onChangeText={setCancelReason}
              maxLength={300}
            />
            {sheetError ? (
              <LiveText tone="danger">{sheetError}</LiveText>
            ) : null}
            <PrimaryButton
              label={forceCancel ? S.forceCancel : S.cancel}
              tone="danger"
              disabled={busy}
              onPress={() =>
                run(
                  () =>
                    sheet === 'cancelWorker' && seatId
                      ? liveWorkApi.cancelWorker(
                          bookingId,
                          seatId,
                          cancelReason.trim(),
                          cancelPreview.business_refund_minor,
                        )
                      : liveWorkApi.cancel(
                          bookingId,
                          cancelReason.trim(),
                          cancelPreview.business_refund_minor,
                        ),
                  true,
                ).then(ok => ok && setSheet(null))
              }
            />
          </View>
        </BottomSheet>
      ) : null}

      {sheet === 'extend' ? (
        <BottomSheet
          title={S.extend}
          subtitle={S.extendBody}
          onClose={() => setSheet(null)}
          closeLabel={S.keep}
        >
          <View style={styles.stack}>
            <ChipGroup
              label={S.extAdditional}
              options={EXTENSION_OPTIONS}
              selected={[String(extendBy)]}
              onToggle={id => loadExtQuote(Number(id))}
            />
            {extQuote ? <LiveExtensionBreakdown quote={extQuote} /> : null}
            {sheetError ? (
              <LiveText tone="danger">{sheetError}</LiveText>
            ) : null}
            <PrimaryButton
              label={S.sendExtension}
              disabled={busy || !extQuote}
              onPress={() =>
                extQuote &&
                run(
                  () =>
                    liveWorkApi.requestExtension(
                      bookingId,
                      extendBy,
                      extQuote.additional_total_minor,
                      seatId,
                    ),
                  true,
                ).then(ok => ok && setSheet(null))
              }
            />
          </View>
        </BottomSheet>
      ) : null}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  stack: { gap: 8 },
  address: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { flex: 1, paddingTop: 1 },
  code: { fontFamily: FONTS.bold, fontSize: 30, letterSpacing: 6 },
});
