import type { BusinessDashboardShift } from '@/pages/businessLive/mock';
import type { BusinessShiftDraft } from '@/types';

export const toLocalDateString = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDurationHours = (startTime: string, endTime: string) => {
  const parseTime = (value: string) => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return start === null || end === null || end <= start
    ? 0
    : (end - start) / 60;
};

export const formatShiftTime = (value: string, locale: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return value;

  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const createDefaultBusinessShiftDraft = (
  responsibilities: string,
  role: string,
): BusinessShiftDraft => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return {
    schedules: [
      {
        date: toLocalDateString(date),
        startTime: '10:00',
        endTime: '16:00',
      },
    ],
    hourlyRate: '175',
    workers: '4',
    responsibilities,
    role,
    location: 'The Fern Events, Indiranagar',
  };
};

export const toBusinessDashboardShifts = (
  draft: BusinessShiftDraft,
  locale: string,
): BusinessDashboardShift[] => {
  const hourlyRate = Number(draft.hourlyRate);

  return draft.schedules.map(schedule => {
    const date = parseLocalDate(schedule.date);
    const hours = getDurationHours(schedule.startTime, schedule.endTime);
    return {
      id: `${draft.id ?? 'business-shift'}-${schedule.date}-${
        schedule.startTime
      }`,
      title: draft.role,
      date: new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(date),
      time: `${schedule.startTime}–${schedule.endTime}`,
      hours,
      area: draft.location,
      requirement: draft.responsibilities,
      distanceKm: 3.2,
      hourlyRate,
      estimatedTotal: hours * hourlyRate,
      applicantCount: 0,
    };
  });
};
