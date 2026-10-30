import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { tr } from '@/services/i18n/tr';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import {
  formatClock,
  formatMinutes,
  formatRupees,
  isRequestTaken,
  liveErrorText,
  LIVE_POLL_MS,
} from '@/services/liveWork/liveWorkFormat';
import {
  LIVE_TEXT as S,
  WORKER_LIVE_STATUS,
} from '@/services/liveWork/liveWorkStrings';
import type {
  WorkerLiveBooking,
  WorkerLiveRequest,
} from '@/services/liveWork/liveWorkTypes';
import {
  useCountdown,
  useLivePolling,
} from '@/services/liveWork/useLivePolling';
import { getDevicePosition } from '@/services/maps/devicePosition';
import type { AppScreenProps } from '@/types';

import { LiveCard, LiveText } from './components/LiveWorkUi';

type Feed = {
  version: string;
  active: WorkerLiveBooking | null;
  requests: WorkerLiveRequest[];
};

async function loadFeed(): Promise<Feed> {
  const [active, requests] = await Promise.all([
    liveWorkApi.active(),
    liveWorkApi.requests(),
  ]);
  return {
    version: [
      active.booking?.version ?? '-',
      ...requests.map(r => `${r.dispatch_id}:${r.expires_at}`),
    ].join('|'),
    active: active.booking,
    requests,
  };
}

const RequestCard: FC<{
  request: WorkerLiveRequest;
  disabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
}> = ({ request, disabled, onAccept, onDecline }) => {
  const [deadline] = useState(() =>
    new Date(Date.now() + request.seconds_left * 1000).toISOString(),
  );
  const left = useCountdown(deadline);
  return (
    <LiveCard testID={`worker-live-request-${request.booking_id}`}>
      <LiveText tone="label">{request.category_name ?? ''}</LiveText>
      <LiveText tone="strong">{request.job_title}</LiveText>
      <LiveText tone="muted">
        {request.pricing_mode === 'task'
          ? `${request.business_name} · ${tr('taskPricing.fixedPriceAmount', {
              amount: formatRupees(request.task_price_minor ?? 0),
            })}`
          : `${request.business_name} · ${formatMinutes(
              request.reserved_minutes,
            )} · ${formatRupees(request.hourly_rate_minor)}/h`}
      </LiveText>
      <LiveText tone="muted">
        {`${request.address_text}${
          request.distance_km !== null ? ` · ${request.distance_km} km` : ''
        }`}
      </LiveText>
      <LiveText tone="strong">
        {S.youEarn(formatRupees(request.worker_net_minor))}
      </LiveText>
      <LiveText tone="muted">{S.respondWithin(formatClock(left))}</LiveText>
      <View style={styles.actions}>
        <PrimaryButton
          label={S.accept}
          onPress={onAccept}
          disabled={disabled || left === 0}
        />
        <SecondaryButton
          label={S.decline}
          onPress={onDecline}
          disabled={disabled}
        />
      </View>
    </LiveCard>
  );
};

/** Worker: incoming Live Work requests and the current Live Work booking. */
export const WorkerLiveWorkPage: FC<
  AppScreenProps<typeof ROUTES.workerLiveWork>
> = ({ navigation }) => {
  const { data, error, offline, refresh } = useLivePolling<Feed>(
    useCallback(loadFeed, []),
    LIVE_POLL_MS,
  );
  const [busy, setBusy] = useState(false);

  const accept = async (request: WorkerLiveRequest) => {
    setBusy(true);
    try {
      const point = await getDevicePosition(8000);
      if (!point) {
        Alert.alert(S.accept, S.needLocation);
        return;
      }
      await liveWorkApi.reportWorkerLocation(point);
      const booking = await liveWorkApi.accept(request.booking_id);
      navigation.replace(ROUTES.workerLiveBooking, {
        assignmentId: booking.assignment_id,
      });
    } catch (cause) {
      Alert.alert(
        S.actionFailed,
        isRequestTaken(cause) ? S.taken : liveErrorText(cause),
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const decline = async (request: WorkerLiveRequest) => {
    setBusy(true);
    try {
      await liveWorkApi.decline(request.booking_id);
    } catch (cause) {
      Alert.alert(S.actionFailed, liveErrorText(cause));
    } finally {
      await refresh();
      setBusy(false);
    }
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.requestsTitle}
      headerTag={S.workerTag}
      gap={14}
      busy={busy}
      isLoading={!data && !error && !offline}
      testID="worker-live-work-page"
    >
      {offline ? <LiveText tone="muted">{S.offline}</LiveText> : null}
      {error ? <LiveText tone="danger">{error}</LiveText> : null}
      {data?.active ? (
        <LiveCard>
          <LiveText tone="label">{S.activeJob}</LiveText>
          <LiveText tone="strong">{data.active.work.job_title}</LiveText>
          <LiveText>
            {WORKER_LIVE_STATUS[data.active.status] ?? data.active.status}
          </LiveText>
          <PrimaryButton
            label={S.open}
            onPress={() =>
              navigation.navigate(ROUTES.workerLiveBooking, {
                assignmentId: data.active!.assignment_id,
              })
            }
          />
        </LiveCard>
      ) : null}
      {data && !data.active && !data.requests.length ? (
        <LiveText tone="muted">{S.noRequests}</LiveText>
      ) : null}
      {data?.requests.map(request => (
        <RequestCard
          key={request.dispatch_id}
          request={request}
          disabled={busy || Boolean(data.active)}
          onAccept={() => accept(request)}
          onDecline={() => decline(request)}
        />
      ))}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 8 },
});
