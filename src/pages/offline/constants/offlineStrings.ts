export const OFFLINE_STRINGS = {
  TITLE: "You're offline",
  SUBTITLE:
    'You can view saved shift details. Booking, publishing and payment actions need a connection.',
  SAVED_BOOKING: 'Saved booking',
  LAST_UPDATED: 'Last updated',
  savedCaption: (code: string, business: string) => `${code} · ${business}`,
  updatedCaption: (time: string) => `Today at ${time} · May be out of date`,
  TRY_RECONNECTING: 'Try reconnecting',
  RECONNECTING: 'Reconnecting…',
  VIEW_SAVED: 'View saved shift',
} as const;
