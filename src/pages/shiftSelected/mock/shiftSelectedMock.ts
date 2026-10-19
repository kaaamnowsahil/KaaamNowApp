import type { Option } from '@/types';

export type Offer = {
  /** Deadline to confirm, e.g. "20 Oct, 18:00". */
  confirmBy: string;
  /** e.g. "Thu, 22 Oct 2026" */
  dateLabel: string;
  breakNote: string;
  workplace: string;
};

export const OFFERS: Record<string, Offer> = {
  'shift-event-service': {
    confirmBy: '20 Oct, 18:00',
    dateLabel: 'Thu, 22 Oct 2026',
    breakNote: 'paid break included',
    workplace: 'The Fern, Indiranagar',
  },
};

export const DEFAULT_OFFER: Offer = {
  confirmBy: 'tomorrow, 18:00',
  dateLabel: '',
  breakNote: 'break as per business policy',
  workplace: '',
};

export const DECLINE_REASONS: Option[] = [
  { id: 'busy', label: 'Not available anymore' },
  { id: 'another', label: 'Took another shift' },
  { id: 'far', label: 'Too far to travel' },
  { id: 'pay', label: 'Pay doesn’t suit me' },
  { id: 'other', label: 'Other' },
];
