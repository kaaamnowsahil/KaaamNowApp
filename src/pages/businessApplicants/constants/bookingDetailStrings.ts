import { localizedRecord, tr } from '@/services/i18n/tr';
import type { Option } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`bookingDetail.${key}`, values);

const option = (group: string, id: string): Option => ({
  id,
  get label() {
    return k(`${group}.${id}`);
  },
});

export const BOOKING_DETAIL_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get CODE_LABEL() {
    return k('codeLabel');
  },
  get CODE_HINT() {
    return k('codeHint');
  },
  status: localizedRecord('bookingDetail.status'),
  onTheWay: (km?: number | null, eta?: number | null) =>
    [
      km != null ? k('kmAway', { km: Math.round(km * 10) / 10 }) : null,
      eta != null ? k('etaMinutes', { eta }) : null,
    ]
      .filter(Boolean)
      .join(' · ') || k('onTheWay'),
  when: (date: string, time: string) => `${date} · ${time}`,
  extendedBy: (minutes: number) => k('extendedBy', { minutes }),
  get CHECKED_IN_AT() {
    return k('checkedInAt');
  },
  get ENDS_AT() {
    return k('endsAt');
  },
  get END_SHIFT() {
    return k('endShift');
  },
  get END_EARLY() {
    return k('endEarly');
  },
  get EXTEND() {
    return k('extend');
  },
  get STOP() {
    return k('stop');
  },
  get CANCEL() {
    return k('cancel');
  },
  get EMERGENCY() {
    return k('emergency');
  },
  call: (phone: string) => k('call', { phone }),
  get RATE() {
    return k('rate');
  },
  get ACTION_FAILED() {
    return k('actionFailed');
  },
  pinForWorker: (pin: string) => k('pinForWorker', { pin }),
  get PIN_TITLE() {
    return k('pinTitle');
  },
  get PIN_BODY() {
    return k('pinBody');
  },
  get PIN_CONFIRM() {
    return k('pinConfirm');
  },
  get PIN_CLOSE() {
    return k('pinClose');
  },
  extensionPending: (minutes: number) => k('extensionPending', { minutes }),
  get EXTEND_TITLE() {
    return k('extendTitle');
  },
  get EXTEND_BODY() {
    return k('extendBody');
  },
  get EXTEND_LABEL() {
    return k('extendLabel');
  },
  get EXTEND_CONFIRM() {
    return k('extendConfirm');
  },
  get EXTEND_CLOSE() {
    return k('extendClose');
  },
  get STOP_TITLE() {
    return k('stopTitle');
  },
  get STOP_BODY() {
    return k('stopBody');
  },
  get STOP_LABEL() {
    return k('stopLabel');
  },
  get STOP_CONFIRM() {
    return k('stopConfirm');
  },
  get STOP_KEEP() {
    return k('stopKeep');
  },
  get CANCEL_TITLE() {
    return k('cancelTitle');
  },
  get FREE_CANCEL() {
    return k('freeCancel');
  },
  feeCancel: (fee: string) => k('feeCancel', { fee }),
  get CANCEL_LABEL() {
    return k('cancelLabel');
  },
  get CANCEL_CONFIRM() {
    return k('cancelConfirm');
  },
  get CANCEL_KEEP() {
    return k('cancelKeep');
  },
};

export const EXTEND_OPTIONS: Option[] = ['30', '60', '90', '120'].map(id =>
  option('extendOptions', id),
);

export const STOP_REASONS: Option[] = ['business_stopped', 'worker_left'].map(
  id => option('stopReasons', id),
);

export const BUSINESS_CANCEL_REASONS: Option[] = [
  'not_needed',
  'closed',
  'over_staffed',
  'other',
].map(id => option('cancelReasons', id));

/** The cancel reason is stored as free text, so the record keeps the English label in every language. */
export const cancelReasonForRecord = (id: string): string =>
  BUSINESS_CANCEL_REASONS.some(item => item.id === id)
    ? tr(`bookingDetail.cancelReasons.${id}`, { lng: 'en' })
    : id;
