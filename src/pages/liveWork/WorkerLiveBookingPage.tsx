import Geolocation from '@react-native-community/geolocation';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import { CompletionCodeField } from '@/components/taskPricing/CompletionCode';
import {
  BottomSheet,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  TextField,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { tr } from '@/services/i18n/tr';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import {
  ARRIVAL_CODE_LENGTH,
  COMPLETION_CODE_LENGTH,
  formatClock,
  formatMinutes,
  formatRupees,
  liveErrorText,
  LIVE_POLL_MS,
  LOCATION_SHARE_MS,
} from '@/services/liveWork/liveWorkFormat';
import {
  LIVE_TEXT as S,
  WORKER_LIVE_STATUS,
} from '@/services/liveWork/liveWorkStrings';
import type {
  LiveCancelPreview,
  LivePoint,
  WorkerLiveBooking,
} from '@/services/liveWork/liveWorkTypes';
import {
  useCountdown,
  useLivePolling,
} from '@/services/liveWork/useLivePolling';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { LiveCard, LiveText, PriceRow } from './components/LiveWorkUi';

type Position = {
  coords: { latitude: number; longitude: number; accuracy: number };
};
const toPoint = ({ coords }: Position): LivePoint => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy_m: Math.round(coords.accuracy),
});

/** Same radius the backend enforces before it accepts the arrival code. */
const ARRIVAL_RADIUS_M = 200;

const metresBetween = (a: LivePoint, b: LivePoint) => {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

const formatDistance = (metres: number) =>
  metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;

async function hasLocationPermission() {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

function currentPoint(): Promise<LivePoint> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(toPoint(position)),
      () => reject(new Error(S.workerLocationOff)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}

/**
 * Sends the device's real position while `enabled`. Nothing is sent when location is off,
 * so the Business sees "location unavailable/stale" instead of a made-up position.
 */
function useLocationSharing(assignmentId: string, enabled: boolean) {
  const [denied, setDenied] = useState(false);
  const latest = useRef<LivePoint | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let watchId: number | null = null;
    let cancelled = false;
    const send = () => {
      if (latest.current)
        liveWorkApi
          .shareLocation(assignmentId, latest.current)
          .catch(() => undefined);
    };
    hasLocationPermission().then(granted => {
      if (cancelled) return;
      if (!granted) {
        setDenied(true);
        return;
      }
      watchId = Geolocation.watchPosition(
        position => {
          const first = latest.current === null;
          latest.current = toPoint(position);
          setDenied(false);
          if (first) send();
        },
        error => {
          if (error.code === error.PERMISSION_DENIED) setDenied(true);
        },
        { enableHighAccuracy: true, distanceFilter: 10 },
      );
    });
    const timer = setInterval(send, LOCATION_SHARE_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
      if (watchId !== null) Geolocation.clearWatch(watchId);
      latest.current = null;
    };
  }, [assignmentId, enabled]);
  return denied;
}

/** Worker view of one accepted Live Work booking. */
export const WorkerLiveBookingPage: FC<
  AppScreenProps<typeof ROUTES.workerLiveBooking>
> = ({ route }) => {
  const { colors } = useTheme();
  const { assignmentId } = route.params;
  const load = useCallback(
    () => liveWorkApi.workerBooking(assignmentId),
    [assignmentId],
  );
  const {
    data: booking,
    setData,
    error: loadError,
    offline,
    refresh,
  } = useLivePolling<WorkerLiveBooking>(load, LIVE_POLL_MS);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [reached, setReached] = useState(false);
  const [cancelPreview, setCancelPreview] = useState<LiveCancelPreview | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState('');
  const [sheetError, setSheetError] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [finishCode, setFinishCode] = useState('');
  const [finishError, setFinishError] = useState('');

  const sharing =
    booking?.status === 'assigned' || booking?.status === 'en_route';
  const locationDenied = useLocationSharing(assignmentId, sharing);
  const workLeft = useCountdown(
    booking?.status === 'in_progress' ? booking.timer?.ends_at : null,
    booking?.server_time,
  );

  const run = async (
    call: () => Promise<WorkerLiveBooking | null | void>,
    onError?: (text: string) => void,
  ) => {
    setBusy(true);
    try {
      const next = await call();
      if (next) setData(next);
      else await refresh();
      return true;
    } catch (error) {
      const text = liveErrorText(error);
      if (onError) onError(text);
      else Alert.alert(S.actionFailed, text);
      await refresh();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startWork = () => {
    setCodeError('');
    if (code.length !== ARRIVAL_CODE_LENGTH) {
      setCodeError(S.codeLength(ARRIVAL_CODE_LENGTH));
      return;
    }
    run(async () => {
      if (!(await hasLocationPermission()))
        throw new Error(S.workerLocationOff);
      const next = await liveWorkApi.startWork(
        assignmentId,
        code,
        await currentPoint(),
      );
      setCode('');
      return next;
    }, setCodeError);
  };

  const confirmReached = () =>
    run(async () => {
      if (!(await hasLocationPermission()))
        throw new Error(S.workerLocationOff);
      const here = await currentPoint();
      const { latitude, longitude } = booking?.work ?? {};
      if (latitude != null && longitude != null) {
        const away = metresBetween(here, { latitude, longitude });
        if (away > ARRIVAL_RADIUS_M)
          throw new Error(S.notReached(formatDistance(away)));
      }
      setReached(true);
    });

  const openComplete = () => {
    setFinishCode('');
    setFinishError('');
    setFinishing(true);
  };

  const confirmComplete = () =>
    run(
      () => liveWorkApi.complete(assignmentId, finishCode),
      setFinishError,
    ).then(ok => {
      if (ok) setFinishing(false);
      else setFinishCode('');
    });

  const openCancel = () =>
    run(async () => {
      setCancelPreview(await liveWorkApi.workerCancelPreview(assignmentId));
      setCancelReason('');
      setSheetError('');
    });

  if (!booking) {
    return (
      <FormScreen
        title={S.trackTitle}
        headerTag={S.workerTag}
        isLoading={!loadError && !offline}
      >
        <LiveText tone="danger">{loadError || S.offline}</LiveText>
        <SecondaryButton label={S.retry} onPress={() => refresh()} />
      </FormScreen>
    );
  }

  const { actions, work, earnings, status } = booking;
  const isTask = work.pricing_mode === 'task';
  const ask = booking.extensions.find(e => e.status === 'requested');
  const canReach = actions.can_start_work && status === 'en_route' && !reached;
  const askCode = actions.can_start_work && status === 'en_route' && reached;

  return (
    <FormScreen
      title={S.trackTitle}
      subtitle={WORKER_LIVE_STATUS[status] ?? status}
      headerTag={S.workerTag}
      gap={14}
      busy={busy}
      testID="worker-live-booking-page"
      actions={
        actions.can_start_travel ||
        canReach ||
        actions.can_complete ||
        actions.can_cancel ? (
          <>
            {actions.can_start_travel ? (
              <PrimaryButton
                label={S.startTravel}
                onPress={() => run(() => liveWorkApi.startTravel(assignmentId))}
                disabled={busy}
              />
            ) : null}
            {canReach ? (
              <PrimaryButton
                label={S.reached}
                onPress={confirmReached}
                disabled={busy}
                testID="worker-live-reached"
              />
            ) : null}
            {actions.can_complete ? (
              <PrimaryButton
                label={isTask ? tr('taskPricing.finishTask') : S.completeWork}
                onPress={openComplete}
                disabled={busy}
                testID="worker-live-complete"
              />
            ) : null}
            {actions.can_cancel ? (
              <SecondaryButton
                label={S.cancel}
                tone="danger"
                onPress={openCancel}
                disabled={busy}
              />
            ) : null}
          </>
        ) : undefined
      }
    >
      <View style={styles.stack}>
        <LiveText tone="title">{work.job_title}</LiveText>
        <LiveText tone="muted">
          {`${work.business_name} · ${work.category_name ?? ''} · ${
            isTask
              ? tr('taskPricing.fixedPrice')
              : formatMinutes(work.reserved_minutes)
          }`}
        </LiveText>
        <View style={styles.address}>
          <MapPinIcon width={16} height={16} color={colors.textMuted} />
          <View style={styles.addressText}>
            <LiveText tone="muted">{work.address_text}</LiveText>
          </View>
        </View>
        {sharing && work.latitude != null && work.longitude != null ? (
          <TextButton
            label={S.directions}
            tone="primary"
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&destination=${work.latitude},${work.longitude}`,
              )
            }
          />
        ) : null}
        {work.arrival_instructions ? (
          <LiveText>{work.arrival_instructions}</LiveText>
        ) : null}
        {work.site_contact_name ? (
          <LiveText tone="muted">{`Contact: ${work.site_contact_name}`}</LiveText>
        ) : null}
      </View>

      {offline ? <LiveText tone="muted">{S.offline}</LiveText> : null}
      {loadError ? <LiveText tone="danger">{loadError}</LiveText> : null}
      {sharing ? (
        <LiveText tone={locationDenied ? 'danger' : 'muted'}>
          {locationDenied ? S.workerLocationOff : S.sharingLocation}
        </LiveText>
      ) : null}

      {askCode && booking.arrival ? (
        <LiveCard testID="worker-live-arrival">
          {booking.arrival.locked ? (
            <LiveText tone="danger">{S.codeLocked}</LiveText>
          ) : (
            <>
              <TextField
                label={S.enterCode}
                value={code}
                onChangeText={value => {
                  setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  setCodeError('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={ARRIVAL_CODE_LENGTH}
                placeholder={'•'.repeat(ARRIVAL_CODE_LENGTH)}
                error={codeError}
                testID="worker-live-code"
              />
              <LiveText tone="muted">
                {S.attemptsLeft(booking.arrival.attempts_left)}
              </LiveText>
              <PrimaryButton
                label={S.startWork}
                onPress={startWork}
                disabled={busy}
                testID="worker-live-start"
              />
            </>
          )}
        </LiveCard>
      ) : null}

      {status === 'in_progress' && booking.timer && !isTask ? (
        <LiveCard>
          <LiveText tone="label">{S.timeLeft}</LiveText>
          <Text style={[styles.clock, { color: colors.text }]}>
            {formatClock(workLeft)}
          </Text>
          {booking.timer.extended_minutes ? (
            <LiveText tone="muted">
              {S.extendedBy(booking.timer.extended_minutes)}
            </LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      {ask && actions.can_answer_extension ? (
        <LiveCard>
          <LiveText>
            {S.extensionAsk(
              ask.extra_minutes,
              formatRupees(ask.worker_net_minor),
            )}
          </LiveText>
          <PrimaryButton
            label={S.acceptExtension}
            onPress={() =>
              run(() => liveWorkApi.answerExtension(assignmentId, ask.id, true))
            }
            disabled={busy}
          />
          <SecondaryButton
            label={S.decline}
            onPress={() =>
              run(() =>
                liveWorkApi.answerExtension(assignmentId, ask.id, false),
              )
            }
            disabled={busy}
          />
        </LiveCard>
      ) : null}

      {booking.cancellation ? (
        <LiveCard>
          <LiveText tone="label">
            {S.cancelledBy[booking.cancellation.cancelled_by ?? 'system'] ??
              WORKER_LIVE_STATUS.cancelled}
          </LiveText>
          {booking.cancellation.reason ? (
            <LiveText>{booking.cancellation.reason}</LiveText>
          ) : null}
        </LiveCard>
      ) : null}

      <LiveCard>
        <LiveText tone="title">{S.earnings}</LiveText>
        <LiveText>
          {S.earningsLine(
            formatRupees(earnings.base_amount_minor),
            formatRupees(earnings.worker_commission_minor),
            formatRupees(earnings.worker_net_minor),
          )}
        </LiveText>
        {earnings.extension_net_minor > 0 ? (
          <LiveText>
            {S.extensionEarnings(formatRupees(earnings.extension_net_minor))}
          </LiveText>
        ) : null}
        <PriceRow
          label={S.totalEarnings}
          strong
          value={formatRupees(earnings.total_net_minor)}
        />
      </LiveCard>

      {finishing ? (
        <BottomSheet
          title={S.completeTitle}
          subtitle={
            isTask ? tr('taskPricing.completeTaskBody') : S.completeBody
          }
          onClose={() => setFinishing(false)}
          closeLabel={S.keepWorking}
        >
          <View style={styles.stack}>
            <CompletionCodeField
              value={finishCode}
              onChange={value => {
                setFinishCode(value);
                setFinishError('');
              }}
              businessName={work.business_name}
              completion={booking.completion}
              error={finishError}
              testID="worker-live-completion-code"
            />
            {booking.completion?.locked ? null : (
              <PrimaryButton
                label={isTask ? tr('taskPricing.finishTask') : S.completeWork}
                onPress={confirmComplete}
                disabled={busy || finishCode.length !== COMPLETION_CODE_LENGTH}
                testID="worker-live-complete-confirm"
              />
            )}
          </View>
        </BottomSheet>
      ) : null}

      {cancelPreview ? (
        <BottomSheet
          title={S.workerCancelTitle}
          subtitle={cancelPreview.effect}
          onClose={() => setCancelPreview(null)}
          closeLabel={S.keepWorking}
        >
          <View style={styles.stack}>
            <LiveText tone="muted">{cancelPreview.rule}</LiveText>
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
              label={S.cancel}
              tone="danger"
              disabled={busy}
              onPress={() =>
                run(
                  () =>
                    liveWorkApi.workerCancel(assignmentId, cancelReason.trim()),
                  setSheetError,
                ).then(ok => ok && setCancelPreview(null))
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
  clock: { fontFamily: FONTS.bold, fontSize: 30 },
});
