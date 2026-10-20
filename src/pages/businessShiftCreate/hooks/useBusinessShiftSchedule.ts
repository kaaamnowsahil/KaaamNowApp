import { useState } from 'react';

import { useBusinessShiftStore } from '@/services/business/useBusinessShiftStore';
import type { BusinessShiftDraft } from '@/types';

import {
  createDefaultBusinessShiftDraft,
  getDurationHours,
  parseLocalDate,
} from '../utils';

export const useBusinessShiftSchedule = (
  initialDraft?: BusinessShiftDraft | null,
  defaults?: { responsibilities: string; role: string },
) => {
  const savedDraft = useBusinessShiftStore(state => state.draft);
  const saveDraft = useBusinessShiftStore(state => state.saveDraft);
  const [draft, setDraft] = useState(
    () =>
      initialDraft ??
      savedDraft ??
      createDefaultBusinessShiftDraft(
        defaults?.responsibilities ?? '',
        defaults?.role ?? '',
      ),
  );
  const update = (changes: Partial<BusinessShiftDraft>) =>
    setDraft(current => ({ ...current, ...changes }));

  const updateDates = (dates: string[]) =>
    setDraft(current => {
      const existing = new Map(
        current.schedules.map(schedule => [schedule.date, schedule]),
      );
      const fallback = current.schedules[0] ?? {
        startTime: '10:00',
        endTime: '16:00',
      };
      return {
        ...current,
        schedules: dates.map(
          date =>
            existing.get(date) ?? {
              date,
              startTime: fallback.startTime,
              endTime: fallback.endTime,
            },
        ),
      };
    });

  const updateSchedule = (
    date: string,
    changes: Partial<Pick<(typeof draft.schedules)[number], 'startTime' | 'endTime'>>,
  ) =>
    setDraft(current => ({
      ...current,
      schedules: current.schedules.map(schedule =>
        schedule.date === date ? { ...schedule, ...changes } : schedule,
      ),
    }));

  const validate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = draft.schedules.map(schedule => parseLocalDate(schedule.date));
    const rate = Number(draft.hourlyRate);
    const workers = Number(draft.workers);

    return {
      isFutureDate:
        dates.length > 0 && dates.every(selectedDate => selectedDate >= today),
      isValid:
        draft.schedules.every(
          schedule =>
            getDurationHours(schedule.startTime, schedule.endTime) > 0,
        ) &&
        Number.isFinite(rate) &&
        rate > 0 &&
        Number.isInteger(workers) &&
        workers > 0 &&
        draft.responsibilities.trim().length > 0,
    };
  };

  return {
    draft,
    update,
    updateDates,
    updateSchedule,
    validate,
    save: () => {
      const saved = {
        ...draft,
        responsibilities: draft.responsibilities.trim(),
      };
      saveDraft(saved);
      return saved;
    },
  };
};
