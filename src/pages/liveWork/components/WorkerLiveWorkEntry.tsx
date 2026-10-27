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
import { useLivePolling } from '@/services/liveWork/useLivePolling';
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
    requestCount: requests.length,
  };
}

/** Worker home: the current Live Work booking or pending Live Work requests, when there are any. */
export const WorkerLiveWorkEntry: FC = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const { data } = useLivePolling(useCallback(loadSummary, []), ENTRY_POLL_MS);
  if (!data || (!data.active && !data.requestCount)) return null;
  const active = data.active;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        active
          ? navigation.navigate(ROUTES.workerLiveBooking, {
              assignmentId: active.assignment_id,
            })
          : navigation.navigate(ROUTES.workerLiveWork)
      }
      testID="worker-live-work-entry"
    >
      <LiveCard>
        <LiveText tone="label">
          {active ? S.activeJob : S.requestsTitle}
        </LiveText>
        <LiveText tone="strong">
          {active
            ? `${active.work.job_title} · ${
                WORKER_LIVE_STATUS[active.status] ?? active.status
              }`
            : S.waiting(data.requestCount)}
        </LiveText>
      </LiveCard>
    </Pressable>
  );
};
