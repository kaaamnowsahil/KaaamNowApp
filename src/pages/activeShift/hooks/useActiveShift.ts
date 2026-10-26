import { useEffect, useState } from 'react';

import { formatDateTime, formatTime } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { bookingRef, useAssignment } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

const POLL_MS = 20000;

const secondsSince = (iso?: string | null) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000)) : 0;

/**
 * Ticks the time-on-shift clock every second from the recorded check-in and
 * re-reads the booking so extension requests, early-end PINs and an end by
 * the business show up without a manual refresh.
 */
export const useActiveShift = (assignmentId?: string | null) => {
  const assignment = useAssignment(assignmentId);
  const { setData } = assignment;
  const contact = useApiQuery(
    async () => (assignmentId ? shiftsApi.contact(assignmentId) : null),
    [assignmentId],
  );
  const detail = assignment.data;
  const checkedInAt = detail?.attendance?.checked_in_at;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(secondsSince(checkedInAt));
    if (!checkedInAt) return;
    const id = setInterval(() => setElapsed(secondsSince(checkedInAt)), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  useEffect(() => {
    if (!assignmentId) return;
    const id = setInterval(() => {
      shiftsApi.assignment(assignmentId).then(setData).catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [assignmentId, setData]);

  return {
    isLoading: assignment.isLoading,
    detail,
    setDetail: setData,
    reference: bookingRef(assignmentId),
    checkInRecorded: checkedInAt ? formatDateTime(checkedInAt) : '—',
    endsAt: detail?.ends_at ? formatTime(detail.ends_at) : null,
    leadName: contact.data?.name ?? '',
    leadPhone: contact.data?.phone ?? '',
    elapsed,
  };
};
