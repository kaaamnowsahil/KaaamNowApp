import { useState } from 'react';

import type { BusinessShiftDraft } from '@/types';

import {
  createDefaultBusinessShiftDraft,
  getDurationHours,
  parseLocalDate,
} from '../utils';

export const useBusinessShiftSchedule = (
  initialDraft?: BusinessShiftDraft | null,
  defaults?: { responsibilities: string; role: string; category: string },
) => {
  const [draft, setDraft] = useState(() => {
    const existingDraft = initialDraft;
    if (existingDraft) {
      return {
        ...existingDraft,
        sameForEveryDate: existingDraft.sameForEveryDate ?? false,
        category: existingDraft.category ?? defaults?.category ?? 'hospitality',
        requirement: existingDraft.requirement ?? '',
        schedules: existingDraft.schedules.map(schedule => ({
          ...schedule,
          role: schedule.role ?? existingDraft.role ?? defaults?.role ?? '',
          category:
            schedule.category ??
            existingDraft.category ??
            defaults?.category ??
            'hospitality',
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
      defaults?.category ?? 'hospitality',
    );
  });
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
        role: current.role,
        category: current.category,
        requirement: current.requirement,
        responsibilities: current.responsibilities,
        workers: current.workers,
        hourlyRate: current.hourlyRate,
      };
      return {
        ...current,
        schedules: dates.map(
          date =>
            existing.get(date) ?? {
              ...fallback,
              date,
            },
        ),
      };
    });

  const updateSchedule = (
    date: string,
    changes: Partial<Omit<(typeof draft.schedules)[number], 'date'>>,
  ) =>
    setDraft(current => {
      const targetDate = current.sameForEveryDate
        ? current.schedules[0]?.date
        : date;
      return {
        ...current,
        schedules: current.schedules.map(schedule =>
          current.sameForEveryDate || schedule.date === targetDate
            ? { ...schedule, ...changes }
            : schedule,
        ),
      };
    });

  const setSameForEveryDate = (enabled: boolean) =>
    setDraft(current => {
      const sharedDetails = current.schedules[0];
      return {
        ...current,
        sameForEveryDate: enabled,
        schedules:
          enabled && sharedDetails
            ? current.schedules.map(schedule => ({
                ...sharedDetails,
                date: schedule.date,
              }))
            : current.schedules,
      };
    });

  const validate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = draft.schedules.map(schedule => parseLocalDate(schedule.date));
    return {
      isFutureDate:
        dates.length > 0 && dates.every(selectedDate => selectedDate >= today),
      isValid:
        draft.responsibilities.trim().length > 0 &&
        draft.schedules.every(schedule => {
          const workers = Number(schedule.workers);
          const rate = Number(schedule.hourlyRate);
          return (
            getDurationHours(schedule.startTime, schedule.endTime) > 0 &&
            schedule.role.trim().length > 0 &&
            schedule.category.trim().length > 0 &&
            schedule.requirement.trim().length > 0 &&
            schedule.responsibilities.trim().length > 0 &&
            Number.isInteger(workers) &&
            workers > 0 &&
            Number.isFinite(rate) &&
            rate > 0
          );
        }),
    };
  };

  return {
    draft,
    update,
    updateDates,
    updateSchedule,
    setSameForEveryDate,
    validate,
    trimmed: () => {
      return {
        ...draft,
        requirement: draft.requirement.trim(),
        role: draft.role.trim(),
        responsibilities: draft.responsibilities.trim(),
        schedules: draft.schedules.map(schedule => ({
          ...schedule,
          role: schedule.role.trim(),
          category: schedule.category.trim(),
          requirement: schedule.requirement.trim(),
          responsibilities: schedule.responsibilities.trim(),
          hourlyRate: schedule.hourlyRate.trim(),
        })),
      };
    },
  };
};
