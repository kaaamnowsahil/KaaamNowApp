import { useState } from 'react';
import { Alert } from 'react-native';

import { errorMessage } from '@/services/api/apiClient';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Shift } from '@/types';

import { toShift } from './shiftMappers';
import { shiftsApi, type AssignmentDetail, type WorkerShiftDetail } from './shiftsApi';

/** Short human reference for an id, e.g. "KN-3F9A2C". */
export const bookingRef = (id?: string | null) =>
  id ? `KN-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : '';

/** Fresh API values win; ids already known on the route param are kept when the API omits them. */
export const mergeShift = (shift: Shift, card?: WorkerShiftDetail | AssignmentDetail['shift'] | null): Shift => {
  if (!card) return shift;
  const next = toShift(card);
  return {
    ...shift,
    ...next,
    applicationId: next.applicationId ?? shift.applicationId,
    applicationStatus: next.applicationStatus ?? shift.applicationStatus,
    assignmentId: next.assignmentId ?? shift.assignmentId,
    assignmentStatus: next.assignmentStatus ?? shift.assignmentStatus,
    confirmBy: shift.confirmBy,
  };
};

export const useWorkerShiftDetail = (shift: Shift) => {
  const query = useApiQuery(() => shiftsApi.shiftDetail(shift.id), [shift.id]);
  return { ...query, shift: mergeShift(shift, query.data) };
};

export const useAssignment = (assignmentId?: string | null) =>
  useApiQuery(
    async () => (assignmentId ? shiftsApi.assignment(assignmentId) : null),
    [assignmentId],
  );

/** Runs one mutation at a time and shows API errors in an alert. */
export const useShiftAction = () => {
  const [busy, setBusy] = useState(false);
  const run = async <T,>(
    action: () => Promise<T>,
    onDone: (result: T) => void,
    errorTitle = 'Couldn’t complete that',
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      onDone(await action());
    } catch (error) {
      Alert.alert(errorTitle, errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
};
