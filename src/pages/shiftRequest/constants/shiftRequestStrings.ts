import type { ShiftStatus } from '@/types';

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export const SHIFT_REQUEST_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  pushMeta: (sender: string, time: string) => `${sender} · ${time}`,
  pushBody: (role: string, when: string) => `${role} · ${when}`,
  km: (km: number) => `${km} km`,
  FROM_LOCATION: 'From your location',
  PAY: 'Pay',
  payCaption: (rate: string, note: string) => `${rate} per hour · ${note}`,
} as const;

/** Copy that differs between Figma "Live · New request nearby" and "Scheduled · New shift near you". */
export const REQUEST_COPY: Record<
  ShiftStatus,
  {
    headerSubtitle: string;
    overline: string;
    heading: string;
    pushTitle: (km: number) => string;
    accept: string;
    decline: string;
  }
> = {
  live: {
    headerSubtitle: 'Live request',
    overline: 'LIVE REQUEST',
    heading: 'New request nearby',
    pushTitle: km => `Live request ${km} km away`,
    accept: 'Accept request',
    decline: 'Decline',
  },
  scheduled: {
    headerSubtitle: 'Scheduled request',
    overline: 'SHIFT · SCHEDULED',
    heading: 'New shift near you',
    pushTitle: km => `New shift ${km} km away`,
    accept: 'Apply for shift',
    decline: 'Not interested',
  },
};

export const LIVE_REQUEST_STRINGS = {
  acceptWithin: (time: string) =>
    `Accept within ${time} or it goes to the next worker.`,
  TIME_TO_ACCEPT: 'Time to accept',
  shiftCaption: (business: string, hours: number) =>
    `${business} · ${plural(hours, 'hour', 'hours')}`,
  EXPIRED: 'Request expired',
} as const;

export const SCHEDULED_REQUEST_STRINGS = {
  SUBTITLE: 'Apply now — the business picks from all applicants.',
  hours: (hours: number) => plural(hours, 'hr', 'hrs'),
  SHIFT_LENGTH: 'Shift length',
  shiftCaption: (date: string, time: string) => `${date} · ${time}`,
} as const;
