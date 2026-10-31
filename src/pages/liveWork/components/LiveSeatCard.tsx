import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import XIcon from '@/assets/figma/x.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import { SecondaryButton } from '@/components/ui';
import { CompletionCodeCard } from '@/components/taskPricing/CompletionCode';
import { FONTS } from '@/constants/fonts';
import { formatClock, formatRupees } from '@/services/liveWork/liveWorkFormat';
import {
  BUSINESS_LIVE_STATUS,
  LIVE_TEXT as S,
} from '@/services/liveWork/liveWorkStrings';
import type { LiveSeat } from '@/services/liveWork/liveWorkTypes';
import { useCountdown } from '@/services/liveWork/useLivePolling';
import { useTheme } from '@/theme/ThemeProvider';

import { LiveCard, LiveText } from './LiveWorkUi';

const SEAT_STATUS: Record<string, string> = {
  confirmed: 'assigned',
  en_route: 'en_route',
  checked_in: 'in_progress',
  checked_out: 'completed',
  approved: 'completed',
  cancelled: 'cancelled',
};

/** One Worker of a several-Worker booking, with the actions for that Worker only. */
export const LiveSeatCard: FC<{
  seat: LiveSeat;
  index: number;
  isTask: boolean;
  busy: boolean;
  serverTime: string;
  onReissueCode: () => void;
  onReissueCompletion: () => void;
  onExtend: () => void;
  onCancel: () => void;
}> = ({
  seat,
  index,
  isTask,
  busy,
  serverTime,
  onReissueCode,
  onReissueCompletion,
  onExtend,
  onCancel,
}) => {
  const { colors } = useTheme();
  const { assignment, arrival_code: arrival, actions, timer } = seat;
  const working = assignment.status === 'checked_in';
  const beforeStart =
    assignment.status === 'confirmed' || assignment.status === 'en_route';
  const left = useCountdown(
    working && !isTask ? timer?.ends_at : null,
    serverTime,
  );
  const status = SEAT_STATUS[assignment.status] ?? assignment.status;
  const testID = `business-live-seat-${index + 1}`;

  return (
    <LiveCard testID={testID}>
      <LiveText tone="label">
        {`${S.workerNumber(index + 1)} · ${
          BUSINESS_LIVE_STATUS[status] ?? status
        }`}
      </LiveText>
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
            ? `${S.distance(assignment.location.distance_km)} · ${S.locationAge(
                assignment.location.age_seconds,
              )}`
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

      {arrival && beforeStart ? (
        <>
          <LiveText tone="label">{S.arrivalCodeTitle}</LiveText>
          {arrival.locked ? (
            <LiveText>{S.arrivalCodeLocked}</LiveText>
          ) : arrival.expired ? (
            <LiveText>{S.arrivalCodeExpired}</LiveText>
          ) : (
            <>
              <Text selectable style={[styles.code, { color: colors.text }]}>
                {arrival.code}
              </Text>
              <LiveText tone="muted">{S.arrivalCodeHint}</LiveText>
            </>
          )}
          {actions.can_reissue_code && (arrival.locked || arrival.expired) ? (
            <SecondaryButton
              label={S.reissueCode}
              onPress={onReissueCode}
              disabled={busy}
            />
          ) : null}
        </>
      ) : null}

      {working ? (
        <CompletionCodeCard
          completion={seat.completion_code}
          busy={busy}
          onReissue={
            actions.can_reissue_completion_code
              ? onReissueCompletion
              : undefined
          }
          testID={`${testID}-completion-code`}
        />
      ) : null}
      {working ? (
        <LiveText tone="muted">
          {isTask ? S.doneHintTask : S.doneHintHourly}
        </LiveText>
      ) : null}

      {working && !isTask && timer ? (
        <LiveText tone="strong">
          {`${formatClock(left)} · ${S.timeLeft}${
            timer.extended_minutes
              ? ` · ${S.extendedBy(timer.extended_minutes)}`
              : ''
          }`}
        </LiveText>
      ) : null}

      {seat.final_invoice ? (
        <LiveText>
          {`${S.finalBill}: ${formatRupees(seat.final_invoice.total_minor)} · ${
            seat.final_invoice.status === 'paid'
              ? S.paid
              : seat.final_invoice.status
          }`}
        </LiveText>
      ) : null}

      {actions.can_extend ? (
        <SecondaryButton
          label={S.extend}
          icon={ClockIcon}
          onPress={onExtend}
          disabled={busy}
          testID={`${testID}-extend`}
        />
      ) : null}
      {actions.can_cancel ? (
        <SecondaryButton
          label={working ? S.forceCancel : S.cancelThisWorker}
          tone="danger"
          icon={XIcon}
          onPress={onCancel}
          disabled={busy}
          testID={`${testID}-cancel`}
        />
      ) : null}
    </LiveCard>
  );
};

const styles = StyleSheet.create({
  code: { fontFamily: FONTS.bold, fontSize: 26, letterSpacing: 6 },
});
