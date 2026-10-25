import type { Option } from '@/types';

export const SHIFT_SELECTED_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_TAG: 'Worker',
  OVERLINE: 'Selected · Confirmation needed',
  HEADING: 'You’ve been selected',
  subtitle: (business: string, deadline: string) =>
    `${business} would like you to join. Confirm by ${deadline} to secure your place.`,
  business: (name: string, verified: boolean) =>
    verified ? `${name} · Verified business` : name,
  timeRange: (time: string, hours: number, note: string) =>
    `${time} · ${hours} ${hours === 1 ? 'hour' : 'hours'}, ${note}`,
  AGREED_RATE: 'Agreed rate',
  rate: (rate: string, total: string) =>
    `${rate}/hour · ${total} estimated earnings`,
  WORKPLACE: 'Workplace',
  workplace: (place: string, km: number) => `${place} · ${km} km`,
  CONFIRM: 'Confirm my place',
  DECLINE: 'Decline offer',
  DECLINE_TITLE: 'Decline this offer?',
  declineBody: (business: string) =>
    `${business} will offer the place to the next worker. This won’t affect your reliability.`,
  DECLINE_REASON: 'Why are you declining?',
  KEEP: 'Keep the offer',
  DECLINED_TITLE: 'Offer declined',
  DECLINED_BODY: 'The business has been told. You can find new shifts on Discover.',
  OK: 'OK',
  THE_DEADLINE: 'the deadline',
  breakNote: (minutes: number) =>
    minutes ? `${minutes} min break` : 'no break',
  CONFIRM_FAILED: 'Couldn’t confirm your place',
  DECLINE_FAILED: 'Couldn’t decline this offer',
} as const;

export const DECLINE_REASONS: Option[] = [
  { id: 'busy', label: 'Not available anymore' },
  { id: 'another', label: 'Took another shift' },
  { id: 'far', label: 'Too far to travel' },
  { id: 'pay', label: 'Pay doesn’t suit me' },
  { id: 'other', label: 'Other' },
];
