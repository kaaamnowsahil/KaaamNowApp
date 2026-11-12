/**
 * Page a notification click should open. Prefers the path stored by the API.
 * Keep in step with KaaamNowBackend/app/services/notifications/notification_links.py
 * and the web copy of this file.
 */

export type NotificationTarget = {
  kind?: string;
  data?: Record<string, unknown> | null;
};

const INBOX = '/notifications';

const LIVE_KINDS = new Set([
  'live_request',
  'live_worker_accepted',
  'live_shift_filled',
  'live_search_expired',
]);

const text = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  return value == null ? '' : String(value);
};

const flag = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  if (typeof value === 'string') return ['1', 'true', 'yes'].includes(value.trim().toLowerCase());
  return Boolean(value);
};

const WORKER_KINDS = new Set([
  'scheduled_shift_nearby',
  'application_selected',
  'application_rejected',
  'earning_credited',
  'withdrawal_paid',
  'withdrawal_failed',
  'strike_added',
  'cancellation_fee',
  'cancellation_compensation',
  'no_show',
  'attendance_approved',
  'extension_requested',
  'shift_reminder',
]);

const BUSINESS_KINDS = new Set([
  'payment_received',
  'application_confirmed',
  'application_declined',
  'application_received',
  'voucher_issued',
  'seats_released',
  'extension_prompt',
  'live_worker_accepted',
  'live_shift_filled',
  'live_search_expired',
  'worker_en_route',
  'worker_checked_in',
  'worker_checked_out',
  'invoice_ready',
]);

function audience(kind: string, data: Record<string, unknown>): 'worker' | 'business' | null {
  if (kind === 'live_request') return flag(data, 'live_work') ? 'business' : 'worker';
  if (kind === 'verification_updated') return data.profile === 'business' ? 'business' : 'worker';
  if (WORKER_KINDS.has(kind)) return 'worker';
  if (BUSINESS_KINDS.has(kind)) return 'business';
  return null;
}

function paymentPath(data: Record<string, unknown>): string {
  const params = new URLSearchParams();
  if (text(data, 'invoice_id')) params.set('invoice', text(data, 'invoice_id'));
  if (text(data, 'payment_id')) params.set('payment', text(data, 'payment_id'));
  const query = params.toString();
  return query ? `/business/payments/detail?${query}` : '/business/payments';
}

function workerPath(kind: string, data: Record<string, unknown>, shiftId: string, assignmentId: string) {
  const live = flag(data, 'live_work');
  if (kind === 'live_request') return shiftId ? `/worker/shift/${shiftId}` : '/worker/live-work';
  if (kind === 'earning_credited') return '/worker/earnings';
  if (kind === 'withdrawal_paid' || kind === 'withdrawal_failed') return '/worker/earnings-history';
  if (kind === 'verification_updated') return '/worker/profile';
  if (kind === 'strike_added' && !assignmentId) return '/worker/profile';
  if (kind === 'booking_adjusted' && !assignmentId && !shiftId) return '/worker/profile';
  if ((kind === 'application_rejected' || kind === 'selection_expired') && !assignmentId) {
    return shiftId && kind === 'application_rejected' ? `/worker/shift/${shiftId}` : '/worker/shifts';
  }
  if (
    (kind === 'scheduled_shift_nearby' || kind === 'application_selected' || kind === 'shift_reminder') &&
    shiftId
  ) {
    return `/worker/shift/${shiftId}`;
  }
  if (live && assignmentId) return `/worker/live-work/${assignmentId}`;
  if (assignmentId) return `/worker/booking/${assignmentId}`;
  if (shiftId) return `/worker/shift/${shiftId}`;
  return '/worker/shifts';
}

function businessPath(kind: string, data: Record<string, unknown>, shiftId: string, assignmentId: string) {
  const live = flag(data, 'live_work');
  if (kind === 'payment_received' || kind === 'invoice_ready') return paymentPath(data);
  if (kind === 'booking_adjusted' && text(data, 'invoice_id')) return paymentPath(data);
  if (kind === 'verification_updated') return '/business/profile';
  if (
    kind === 'application_declined' ||
    kind === 'application_received' ||
    kind === 'selection_expired'
  ) {
    return '/business/applicants';
  }
  if (kind === 'voucher_issued') return '/business/shifts';
  if (live && shiftId) return `/business/live-work/${shiftId}`;
  if (
    kind === 'live_worker_accepted' ||
    kind === 'live_shift_filled' ||
    kind === 'live_search_expired' ||
    kind === 'live_request'
  ) {
    return '/business/live';
  }
  if (assignmentId) return `/business/booking/${assignmentId}`;
  if (shiftId) return '/business/shifts';
  return '/business/live';
}

function computedPath(
  kind: string,
  data: Record<string, unknown>,
  role?: 'worker' | 'business',
): string {
  const who = audience(kind, data) ?? role ?? null;
  if (!who) return INBOX;
  const shiftId = text(data, 'shift_id');
  const assignmentId = text(data, 'assignment_id');
  return who === 'worker'
    ? workerPath(kind, data, shiftId, assignmentId)
    : businessPath(kind, data, shiftId, assignmentId);
}

/** In-app path. External URLs are ignored. `role` is used when the kind alone is ambiguous. */
export function notificationPath(
  item: NotificationTarget,
  role?: 'worker' | 'business' | null,
): string {
  const data = item.data ?? {};
  const kind = item.kind ?? text(data, 'kind');
  const stored = data.path;
  if (
    typeof stored === 'string' &&
    stored.startsWith('/') &&
    !stored.startsWith('//') &&
    !LIVE_KINDS.has(kind)
  ) {
    return stored;
  }
  return computedPath(
    kind,
    data,
    role === 'worker' || role === 'business' ? role : undefined,
  );
}
