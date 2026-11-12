import { useNavigation } from '@react-navigation/native';
import type { FC } from 'react';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import {
  LIVE_TEXT as S,
  WORKER_LIVE_STATUS,
} from '@/services/liveWork/liveWorkStrings';
import type { WorkerLiveRequest } from '@/services/liveWork/liveWorkTypes';
import { useLivePolling } from '@/services/liveWork/useLivePolling';
import { useRealtime } from '@/services/realtime/useRealtime';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import type { TabAppNavigation } from '@/types';

import { LiveCard, LiveText } from './LiveWorkUi';

const ENTRY_POLL_MS = 15000;

async function loadSummary() {
  const [active, requests] = await Promise.all([
    liveWorkApi.active(),
    liveWorkApi.requests(),
  ]);
  return {
    version: `${active.booking?.version ?? '-'}|${requests.length}`,
    active: active.booking,
    request: requests[0] ?? null,
  };
}

/** Worker home: the current Live Work booking, or a tap through to the offer. */
export const WorkerLiveWorkEntry: FC = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const { data, refresh } = useLivePolling(
    useCallback(loadSummary, []),
    ENTRY_POLL_MS,
  );
  useRealtime('live_requests', () => {
    refresh().catch(() => undefined);
  });
  if (!data || (!data.active && !data.request)) return null;
  const active = data.active;
  const request = data.request;

  const openOffer = (offer: WorkerLiveRequest) => {
    shiftsApi
      .shiftDetail(offer.booking_id)
      .then(detail => navigation.navigate(ROUTES.shiftDetails, { shift: toShift(detail) }))
      .catch(() => undefined);
  };

  if (!active && request) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => openOffer(request)}
        testID="worker-live-work-entry"
      >
        <LiveCard>
          <LiveText tone="label">{request.category_name ?? ''}</LiveText>
          <LiveText tone="strong">{request.job_title}</LiveText>
        </LiveCard>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        navigation.navigate(ROUTES.workerLiveBooking, {
          assignmentId: active!.assignment_id,
        })
      }
      testID="worker-live-work-entry"
    >
      <LiveCard>
        <LiveText tone="label">{S.activeJob}</LiveText>
        <LiveText tone="strong">
          {`${active!.work.job_title} · ${
            WORKER_LIVE_STATUS[active!.status] ?? active!.status
          }`}
        </LiveText>
      </LiveCard>
    </Pressable>
  );
};
