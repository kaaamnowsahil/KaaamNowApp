export const SHIFT_REVIEW_STRINGS = {
  WORKERS_PAY: 'Workers’ pay',
  gatewayFee: (pct: number) => `Payment gateway (${pct}%)`,
  platformCommission: (pct: number) => `Platform commission (${pct}%)`,
  promoDiscount: (code: string) => `Promo ${code.toUpperCase()}`,
  SHIFT_TOTAL: 'Shift total',
  ESTIMATED_TOTAL: 'Estimated total',
  DEPOSIT_NOTE:
    'You pay this deposit now; workers can book once it is paid. Shifts must start at least 24 hours from now.',
  ESTIMATE_FAILED: 'Couldn’t calculate the cost',
  PROMO_LABEL: 'Promo code or voucher',
  PROMO_PLACEHOLDER: 'Enter code',
  PROMO_APPLY: 'Apply',
  PROMO_REMOVE: 'Remove',
  PROMO_FAILED: 'Code can’t be used',
  promoApplied: (code: string) => `Promo ${code.toUpperCase()} applied`,
  promoSaved: (amount: string) => ` · you save ${amount}`,
  payAndPost: (amount: string) => `Pay ${amount} and post`,
  POST_FAILED: 'Couldn’t post the shift',
  CANCELLATION_TITLE: 'Cancellation policy',
  CANCELLATION_INTRO:
    'If you cancel after a worker has booked, a cancellation fee applies based on how long before the start you cancel.',
  tierWindow: (from: number, to: number | null) => {
    if (to == null) return `More than ${from}h before start`;
    if (from === 0) return `Less than ${to}h before start`;
    return `${to}h – ${from}h before start`;
  },
  TIER_FREE: 'Free',
  tierFee: (pct: number) => `${pct}% of workers’ pay`,
  CANCELLATION_FREE_UNBOOKED: 'Cancelling is free while no worker has booked.',
  CANCELLATION_GATEWAY:
    'The payment gateway charge is not refundable; commission is refunded with the rest.',
  unfilledSeats: (hours: number, days: number) =>
    `If no worker books your shift by ${hours}h before start, you get a full refund plus a free-fees voucher that waives the platform and gateway charges on your next shift (valid ${days} days).`,
  workerCancelVoucher: (hours: number, days: number) =>
    `If a worker cancels within ${hours}h or doesn’t show up, you get a full refund plus a free-fees voucher valid for ${days} days.`,
  CANCELLATION_LOAD_FAILED: 'Couldn’t load the cancellation policy',
  TERMS_AGREE: 'By paying, you agree to the cancellation policy and the Business terms.',
  READ_TERMS: 'Read full terms',
} as const;
