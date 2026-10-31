import type { ShiftBulkItem } from '@/services/shifts/shiftsApi';
import type { BusinessShiftDraft, BusinessShiftSlot } from '@/types';

import { tr } from '@/services/i18n/tr';
import { MAX_TASK_PRICE_RUPEES } from '@/services/liveWork/liveWorkFormat';

import { SHIFT_FORM_ERRORS as E } from './constants/shiftFormErrors';

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
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/** Shift length in hours, at most two decimals. */
export const roundedHours = (startTime: string, endTime: string) =>
  Number(getDurationHours(startTime, endTime).toFixed(2));

let slotCounter = 0;
export const newSlotId = () => `slot-${Date.now()}-${(slotCounter += 1)}`;

export const createDefaultBusinessShiftDraft = (
  responsibilities: string,
  role: string,
  category = '',
): BusinessShiftDraft => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return {
    schedules: [
      {
        id: newSlotId(),
        breakMinutes: '',
        date: toLocalDateString(date),
        startTime: '',
        endTime: '',
        role,
        category,
        requirement: '',
        responsibilities,
        workers: '1',
        hourlyRate: '',
      },
    ],
    hourlyRate: '',
    workers: '1',
    responsibilities,
    requirement: '',
    role,
    category,
    location: '',
  };
};

/** Scheduled shifts must be posted at least this far ahead (backend: SCHEDULED_MIN_LEAD_HOURS). */
export const MIN_LEAD_HOURS = 24;

/** Local date + "HH:MM" as a Date. */
export const scheduleAt = (dateValue: string, time: string) => {
  const date = parseLocalDate(dateValue);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
};

export type SlotErrors = Partial<
  Record<
    | 'role'
    | 'category'
    | 'startTime'
    | 'endTime'
    | 'workers'
    | 'hourlyRate'
    | 'breakMinutes'
    | 'taskPrice'
    | 'responsibilities',
    string
  >
>;

/** Field-level problems for one shift; empty object when it is ready to post. */
export const slotErrors = (slot: BusinessShiftSlot): SlotErrors => {
  const errors: SlotErrors = {};
  const hours = getDurationHours(slot.startTime, slot.endTime);
  const workers = Number(slot.workers);
  const rate = Number(slot.hourlyRate);
  const breakText = (slot.breakMinutes ?? '').trim();
  const breakMinutes = Number(breakText);
  if (!slot.role.trim()) errors.role = E.ROLE;
  if (!slot.category.trim()) errors.category = E.CATEGORY;
  if (!slot.startTime) errors.startTime = E.START;
  else if (
    slot.date &&
    scheduleAt(slot.date, slot.startTime).getTime() < Date.now() + MIN_LEAD_HOURS * 3600000
  ) {
    errors.startTime = E.tooSoon(MIN_LEAD_HOURS);
  }
  if (!slot.workers.trim() || !Number.isInteger(workers) || workers < 1) {
    errors.workers = E.WORKERS;
  }
  if (!slot.responsibilities.trim()) errors.responsibilities = E.RESPONSIBILITIES;
  if (slot.pricingMode === 'task') {
    const price = Number((slot.taskPrice ?? '').trim());
    if (!(slot.taskPrice ?? '').trim() || !Number.isFinite(price) || price <= 0) {
      errors.taskPrice = tr('taskPricing.taskPriceRequired');
    } else if (price > MAX_TASK_PRICE_RUPEES) {
      errors.taskPrice = tr('taskPricing.taskPriceMax', {
        max: MAX_TASK_PRICE_RUPEES.toLocaleString('en-IN'),
      });
    }
    return errors;
  }
  if (!slot.endTime) errors.endTime = E.END;
  else if (slot.startTime && hours === 0) errors.endTime = E.END_BEFORE_START;
  if (!slot.hourlyRate.trim() || !Number.isFinite(rate) || rate <= 0) {
    errors.hourlyRate = E.PAY;
  }
  if (
    !breakText ||
    !Number.isInteger(breakMinutes) ||
    breakMinutes < 0 ||
    (hours > 0 && breakMinutes >= hours * 60)
  ) {
    errors.breakMinutes = E.BREAK;
  }
  return errors;
};

/** Dates in selection order, one per day even when a day has several shifts. */
export const uniqueDates = (draft: BusinessShiftDraft) => [
  ...new Set(draft.schedules.map(({ date }) => date)),
];

/**
 * Hourly: rate, start, end and break. Task: one fixed price and a start; the server
 * sets the working window itself.
 */
export const slotPricing = (schedule: BusinessShiftSlot) => {
  const at = (time: string) => scheduleAt(schedule.date, time).toISOString();
  if (schedule.pricingMode === 'task') {
    return {
      pricing_mode: 'task' as const,
      task_price_minor: Math.round(Number(schedule.taskPrice) * 100),
      starts_at: at(schedule.startTime),
      break_minutes: 0,
    };
  }
  return {
    pricing_mode: 'hourly' as const,
    hourly_rate_minor: Math.round(Number(schedule.hourlyRate) * 100),
    starts_at: at(schedule.startTime),
    ends_at: at(schedule.endTime),
    break_minutes: Number(schedule.breakMinutes || 0),
  };
};

/** One API shift per slot; times are the business's local time. */
export const toBulkItems = (draft: BusinessShiftDraft): ShiftBulkItem[] =>
  draft.schedules.map(schedule => {
    return {
      category_slug: schedule.category,
      job_title: schedule.role.trim(),
      responsibilities: schedule.responsibilities.trim(),
      requirements: schedule.requirement.trim() || undefined,
      workers_required: Number(schedule.workers),
      ...slotPricing(schedule),
      address_text: draft.location.trim() || undefined,
      latitude: draft.latitude ?? undefined,
      longitude: draft.longitude ?? undefined,
    };
  });
