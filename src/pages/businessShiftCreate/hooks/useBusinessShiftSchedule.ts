import { useCallback, useState } from 'react';

import type { BusinessShiftDraft, BusinessShiftSlot } from '@/types';

import { SHIFT_FORM_ERRORS } from '../constants/shiftFormErrors';
import {
  createDefaultBusinessShiftDraft,
  newSlotId,
  slotErrors,
  uniqueDates,
  type SlotErrors,
} from '../utils';

/** Copies the first date's shifts onto every other selected date. */
const replicate = (schedules: BusinessShiftSlot[], dates: string[]) => {
  const template = schedules.filter(slot => slot.date === dates[0]);
  return dates.flatMap(date =>
    date === dates[0]
      ? template
      : template.map(slot => ({ ...slot, date, id: newSlotId() })),
  );
};

export const useBusinessShiftSchedule = (
  initialDraft?: BusinessShiftDraft | null,
  defaults?: { responsibilities: string; role: string; category: string },
) => {
  const [draft, setDraft] = useState<BusinessShiftDraft>(() => {
    const existingDraft = initialDraft;
    if (existingDraft) {
      return {
        ...existingDraft,
        sameForEveryDate: existingDraft.sameForEveryDate ?? false,
        category: existingDraft.category ?? defaults?.category ?? '',
        requirement: existingDraft.requirement ?? '',
        schedules: existingDraft.schedules.map(schedule => ({
          ...schedule,
          id: schedule.id ?? newSlotId(),
          breakMinutes: schedule.breakMinutes ?? '',
          role: schedule.role ?? existingDraft.role ?? defaults?.role ?? '',
          category:
            schedule.category ??
            existingDraft.category ??
            defaults?.category ??
            '',
          requirement:
            schedule.requirement ?? existingDraft.requirement ?? '',
          responsibilities:
            schedule.responsibilities ?? existingDraft.responsibilities ?? '',
          workers: schedule.workers ?? existingDraft.workers ?? '1',
          hourlyRate: schedule.hourlyRate ?? existingDraft.hourlyRate ?? '',
        })),
      };
    }
    return createDefaultBusinessShiftDraft(
      defaults?.responsibilities ?? '',
      defaults?.role ?? '',
      defaults?.category ?? '',
    );
  });

  const commit = (
    current: BusinessShiftDraft,
    schedules: BusinessShiftSlot[],
    dates = uniqueDates({ ...current, schedules }),
  ): BusinessShiftDraft => ({
    ...current,
    schedules: current.sameForEveryDate ? replicate(schedules, dates) : schedules,
  });

  const update = useCallback(
    (changes: Partial<BusinessShiftDraft>) =>
      setDraft(current => ({ ...current, ...changes })),
    [],
  );

  const updateDates = (dates: string[]) =>
    setDraft(current => {
      const template = current.schedules.filter(
        slot => slot.date === current.schedules[0]?.date,
      );
      const fallback: BusinessShiftSlot[] = template.length
        ? template
        : [
            {
              date: '',
              startTime: '',
              endTime: '',
              role: current.role,
              category: current.category,
              requirement: current.requirement,
              responsibilities: current.responsibilities,
              workers: current.workers,
              hourlyRate: current.hourlyRate,
              breakMinutes: '',
            },
          ];
      const schedules = dates.flatMap(date => {
        const existing = current.schedules.filter(slot => slot.date === date);
        return existing.length
          ? existing
          : fallback.map(slot => ({ ...slot, date, id: newSlotId() }));
      });
      return commit(current, schedules, dates);
    });

  const updateSchedule = (
    id: string,
    changes: Partial<Omit<BusinessShiftSlot, 'date' | 'id'>>,
  ) =>
    setDraft(current =>
      commit(
        current,
        current.schedules.map(slot =>
          slot.id === id ? { ...slot, ...changes } : slot,
        ),
      ),
    );

  const addShift = (date: string) =>
    setDraft(current => {
      const sameDay = current.schedules.filter(slot => slot.date === date);
      const last = sameDay[sameDay.length - 1];
      if (!last) return current;
      const index = current.schedules.lastIndexOf(last);
      const schedules = [...current.schedules];
      schedules.splice(index + 1, 0, { ...last, id: newSlotId() });
      return commit(current, schedules);
    });

  const removeShift = (id: string) =>
    setDraft(current => {
      const target = current.schedules.find(slot => slot.id === id);
      if (
        !target ||
        current.schedules.filter(slot => slot.date === target.date).length < 2
      ) {
        return current;
      }
      return commit(
        current,
        current.schedules.filter(slot => slot.id !== id),
      );
    });

  const setSameForEveryDate = (enabled: boolean) =>
    setDraft(current =>
      commit({ ...current, sameForEveryDate: enabled }, current.schedules),
    );

  /** Per-slot field errors (keyed by slot id) plus the date-selection error. */
  const validate = () => {
    const slots: Record<string, SlotErrors> = {};
    for (const slot of draft.schedules) {
      const errors = slotErrors(slot);
      if (Object.keys(errors).length) slots[slot.id ?? ''] = errors;
    }
    const dates = draft.schedules.length ? undefined : SHIFT_FORM_ERRORS.DATES;
    return { dates, slots, hasErrors: Boolean(dates) || Object.keys(slots).length > 0 };
  };

  return {
    draft,
    dates: uniqueDates(draft),
    update,
    updateDates,
    updateSchedule,
    addShift,
    removeShift,
    setSameForEveryDate,
    validate,
    trimmed: (): BusinessShiftDraft => ({
      ...draft,
      requirement: draft.requirement.trim(),
      role: draft.role.trim(),
      responsibilities: draft.responsibilities.trim(),
      location: draft.location.trim(),
      schedules: draft.schedules.map(schedule => ({
        ...schedule,
        role: schedule.role.trim(),
        category: schedule.category.trim(),
        requirement: schedule.requirement.trim(),
        responsibilities: schedule.responsibilities.trim(),
        hourlyRate: schedule.hourlyRate.trim(),
        breakMinutes: (schedule.breakMinutes ?? '').trim(),
      })),
    }),
  };
};
