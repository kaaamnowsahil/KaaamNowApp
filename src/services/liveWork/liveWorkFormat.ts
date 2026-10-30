import { ApiError } from '@/services/api/apiClient';
import { tr } from '@/services/i18n/tr';

import type { PricingMode } from './liveWorkTypes';

export const RESERVED_MINUTE_OPTIONS = Array.from(
  { length: 23 },
  (_, i) => 60 + i * 30,
);
export const EXTENSION_MINUTE_OPTIONS = [30, 60, 90, 120, 180, 240];
export const LIVE_POLL_MS = 5000;
export const LOCATION_SHARE_MS = 20000;
export const ARRIVAL_CODE_LENGTH = 6;
export const COMPLETION_CODE_LENGTH = 6;
/** Server default; tries left are shown only after a wrong code. */
export const COMPLETION_CODE_ATTEMPTS = 5;
const MAX_RATE_RUPEES = 100000;
export const MAX_TASK_PRICE_RUPEES = 1000000;

/** Keeps only digits, at most the code length. */
export const cleanCompletionCode = (value: string) =>
  value.replace(/\D/g, '').slice(0, COMPLETION_CODE_LENGTH);

export const formatRupees = (minor: number) =>
  `₹${(minor / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const formatPct = (value: number) =>
  `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;

export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return tr('liveWork.durationMinutes', { minutes: rest });
  return rest
    ? tr('liveWork.durationHoursMinutes', { hours, minutes: rest })
    : tr('liveWork.durationHours', { hours });
};

export const formatClock = (seconds: number | null) => {
  if (seconds === null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** "450", "450.5", "450.50" → paise; null when not a valid amount. */
export function rupeesToMinor(value: string): number | null {
  const text = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export type LiveWorkForm = {
  categorySlug: string;
  jobTitle: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instructions: string;
  siteContact: string;
  pricingMode: PricingMode;
  durationMinutes: number;
  rate: string;
  taskPrice: string;
};

export type LiveWorkFormErrors = Partial<
  Record<keyof LiveWorkForm | 'terms', string>
>;

/** Inline checks before asking the server for a quote; the server validates again. */
export function validateLiveWorkForm(form: LiveWorkForm): LiveWorkFormErrors {
  const errors: LiveWorkFormErrors = {};
  if (!form.categorySlug)
    errors.categorySlug = tr('liveWork.validation.category');
  if (form.jobTitle.trim().length < 2)
    errors.jobTitle = tr('liveWork.validation.jobTitle');
  if (form.address.trim().length < 3)
    errors.address = tr('liveWork.validation.address');
  else if (form.latitude === null || form.longitude === null)
    errors.address = tr('liveWork.validation.unplaced');
  if (form.pricingMode === 'task') {
    const price = rupeesToMinor(form.taskPrice);
    if (price === null || price <= 0)
      errors.taskPrice = tr('taskPricing.taskPriceRequired');
    else if (price > MAX_TASK_PRICE_RUPEES * 100)
      errors.taskPrice = tr('taskPricing.taskPriceMax', {
        max: MAX_TASK_PRICE_RUPEES.toLocaleString('en-IN'),
      });
    return errors;
  }
  if (!RESERVED_MINUTE_OPTIONS.includes(form.durationMinutes))
    errors.durationMinutes = tr('liveWork.validation.duration');
  const minor = rupeesToMinor(form.rate);
  if (minor === null || minor <= 0)
    errors.rate = tr('liveWork.validation.rate');
  else if (minor > MAX_RATE_RUPEES * 100)
    errors.rate = tr('liveWork.validation.rateTooHigh');
  return errors;
}

const SERVER_FIELDS: Record<string, keyof LiveWorkFormErrors> = {
  category_slug: 'categorySlug',
  job_title: 'jobTitle',
  description: 'description',
  address_text: 'address',
  latitude: 'address',
  longitude: 'address',
  arrival_instructions: 'instructions',
  site_contact_name: 'siteContact',
  duration_minutes: 'durationMinutes',
  hourly_rate_minor: 'rate',
  task_price_minor: 'taskPrice',
  accept_terms: 'terms',
};

/** Maps server `details.fields` (snake_case) onto the form's inline errors. */
export function serverFieldErrors(error: unknown): LiveWorkFormErrors {
  if (!(error instanceof ApiError)) return {};
  const mapped: LiveWorkFormErrors = {};
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    const key = SERVER_FIELDS[field];
    if (key) mapped[key] = message;
  }
  return mapped;
}

/** Error text for an alert, with the support reference for server-side failures. */
export function liveErrorText(error: unknown): string {
  if (error instanceof ApiError) {
    const ref =
      error.requestId && error.status >= 500
        ? ` (Ref: ${error.requestId})`
        : '';
    return `${error.message}${ref}`;
  }
  return error instanceof Error && error.message
    ? error.message
    : tr('liveWork.errorGeneric');
}

export const isLiveWorkNotFound = (error: unknown) =>
  error instanceof ApiError && error.code === 'live_work_not_found';

const TAKEN_CODES = new Set([
  'shift_full',
  'shift_not_recruiting',
  'no_live_offer',
  'live_work_not_found',
]);
export const isRequestTaken = (error: unknown) =>
  error instanceof ApiError && TAKEN_CODES.has(error.code);

export function newIdempotencyKey(): string {
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random()}-${random()}`;
}

/** Seconds until `deadline`, corrected for the device clock using the server's `now`. */
export function secondsUntil(
  deadline: string | null | undefined,
  skewMs: number,
  nowMs = Date.now(),
) {
  if (!deadline) return null;
  return Math.max(
    0,
    Math.round((new Date(deadline).getTime() - (nowMs + skewMs)) / 1000),
  );
}
