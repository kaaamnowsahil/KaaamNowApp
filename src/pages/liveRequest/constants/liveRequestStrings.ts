export const LIVE_REQUEST_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_SUBTITLE: 'Live request',
  pushMeta: (sender: string, time: string) => `${sender} · ${time}`,
  pushTitle: (km: number) => `Live request ${km} km away`,
  pushBody: (role: string, starts: string) => `${role} · ${starts}`,
  OVERLINE: 'LIVE REQUEST',
  HEADING: 'New request nearby',
  acceptWithin: (time: string) =>
    `Accept within ${time} or it goes to the next worker.`,
  km: (km: number) => `${km} km`,
  FROM_LOCATION: 'From your location',
  TIME_TO_ACCEPT: 'Time to accept',
  shiftCaption: (business: string, hours: number) =>
    `${business} · ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
  PAY: 'Pay',
  payCaption: (rate: string, note: string) => `${rate} per hour · ${note}`,
  ACCEPT: 'Accept request',
  EXPIRED: 'Request expired',
  DECLINE: 'Decline',
} as const;
