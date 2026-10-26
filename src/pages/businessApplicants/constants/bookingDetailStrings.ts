import type { Option } from '@/types';

export const BOOKING_DETAIL_STRINGS = {
  TITLE: 'Booking',
  CODE_LABEL: 'Check-in code',
  CODE_HINT: 'Tell the worker this code when they arrive. It’s unique to this booking.',
  status: {
    confirmed: 'Booked',
    en_route: 'On the way',
    checked_in: 'Working',
    checked_out: 'Shift ended',
    approved: 'Completed',
    no_show: 'No-show',
    cancelled: 'Cancelled',
  } as Record<string, string>,
  onTheWay: (km?: number | null, eta?: number | null) =>
    [km != null ? `${Math.round(km * 10) / 10} km away` : null, eta != null ? `about ${eta} min` : null]
      .filter(Boolean)
      .join(' · ') || 'On the way',
  when: (date: string, time: string) => `${date} · ${time}`,
  extendedBy: (minutes: number) => `Extended by ${minutes} min`,
  CHECKED_IN_AT: 'Checked in',
  ENDS_AT: 'Ends',
  END_SHIFT: 'End shift',
  END_EARLY: 'End shift early',
  EXTEND: 'Ask to stay longer',
  STOP: 'Stop work now',
  CANCEL: 'Cancel booking',
  EMERGENCY: 'Emergency help',
  RATE: 'Rate worker',
  ACTION_FAILED: 'Couldn’t update the booking',
  pinForWorker: (pin: string) =>
    `The worker wants to end early. If you agree, tell them this PIN: ${pin}`,
  PIN_TITLE: 'Enter the worker’s PIN',
  PIN_BODY: 'We’ve asked the worker to end early. Their app now shows a 4-digit PIN; enter it here. You pay for the time actually worked.',
  PIN_CONFIRM: 'End shift',
  PIN_CLOSE: 'Not now',
  extensionPending: (minutes: number) => `Waiting for the worker to accept ${minutes} more minutes`,
  EXTEND_TITLE: 'Ask the worker to stay longer',
  EXTEND_BODY: 'Extra time is paid at the overtime rate (130%). The worker has to accept.',
  EXTEND_LABEL: 'Extra time',
  EXTEND_CONFIRM: 'Send request',
  EXTEND_CLOSE: 'Cancel',
  STOP_TITLE: 'Stop work without the worker’s PIN?',
  STOP_BODY: 'If you’re sending the worker home, you pay the full booking. If the worker walked off, you pay only the time worked.',
  STOP_LABEL: 'What happened?',
  STOP_CONFIRM: 'Stop work',
  STOP_KEEP: 'Keep working',
  CANCEL_TITLE: 'Cancel this booking?',
  FREE_CANCEL: 'Cancelling now is free.',
  feeCancel: (fee: string) => `Cancelling now costs ${fee}, kept from your deposit. The worker is compensated.`,
  CANCEL_LABEL: 'Reason',
  CANCEL_CONFIRM: 'Cancel booking',
  CANCEL_KEEP: 'Keep booking',
} as const;

export const EXTEND_OPTIONS: Option[] = [
  { id: '30', label: '30 min' },
  { id: '60', label: '1 hour' },
  { id: '90', label: '1.5 hours' },
  { id: '120', label: '2 hours' },
];

export const STOP_REASONS: Option[] = [
  { id: 'business_stopped', label: 'We’re sending the worker home' },
  { id: 'worker_left', label: 'The worker walked off' },
];

export const BUSINESS_CANCEL_REASONS: Option[] = [
  { id: 'not_needed', label: 'No longer needed' },
  { id: 'closed', label: 'Business closed that day' },
  { id: 'over_staffed', label: 'Over-staffed' },
  { id: 'other', label: 'Other' },
];
