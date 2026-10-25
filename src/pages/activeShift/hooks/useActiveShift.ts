import { useEffect, useState } from 'react';

import { formatDateTime } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { bookingRef, useAssignment } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

const secondsSince = (iso?: string | null) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000)) : 0;

/** Ticks the time-on-shift clock every second from the recorded check-in. */
export const useActiveShift = (assignmentId?: string | null) => {
  const assignment = useAssignment(assignmentId);
  const contact = useApiQuery(
    async () => (assignmentId ? shiftsApi.contact(assignmentId) : null),
    [assignmentId],
  );
  const checkedInAt = assignment.data?.attendance?.checked_in_at;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(secondsSince(checkedInAt));
    if (!checkedInAt) return;
    const id = setInterval(() => setElapsed(secondsSince(checkedInAt)), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  return {
    isLoading: assignment.isLoading,
    reference: bookingRef(assignmentId),
    checkInRecorded: checkedInAt ? formatDateTime(checkedInAt) : '—',
    leadName: contact.data?.name ?? '',
    leadPhone: contact.data?.phone ?? '',
    elapsed,
  };
};
