import type { ShiftBulkItem } from '@/services/shifts/shiftsApi';
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
  category = 'hospitality',
): BusinessShiftDraft => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return {
    schedules: [
      {
        date: toLocalDateString(date),
        startTime: '10:00',
        endTime: '16:00',
        role,
        category,
        requirement: '',
        responsibilities,
        workers: '4',
        hourlyRate: '175',
      },
    ],
    hourlyRate: '175',
    workers: '4',
    responsibilities,
    requirement: '',
    role,
    category,
    location: '',
  };
};

/** One API shift per selected date; times are the business's local time. */
export const toBulkItems = (draft: BusinessShiftDraft): ShiftBulkItem[] =>
  draft.schedules.map(schedule => {
    const date = parseLocalDate(schedule.date);
    const at = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
      ).toISOString();
    };
    return {
      category_slug: schedule.category,
      job_title: schedule.role.trim(),
      responsibilities: schedule.responsibilities.trim(),
      requirements: schedule.requirement.trim(),
      workers_required: Number(schedule.workers),
      hourly_rate_minor: Math.round(Number(schedule.hourlyRate) * 100),
      starts_at: at(schedule.startTime),
      ends_at: at(schedule.endTime),
    };
  });
