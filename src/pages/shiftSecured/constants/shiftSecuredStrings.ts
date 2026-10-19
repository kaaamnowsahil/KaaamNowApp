export const SHIFT_SECURED_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_RIGHT: 'Worker',
  confirmed: (code: string) => `Confirmed · ${code}`,
  HEADING: 'Your shift is secured',
  subtitle: (minutes: number, start: string, contact: string) =>
    `You have the place. Arrive ${minutes} minutes before ${start} and ask for ${contact}.`,
  business: (name: string, verified: boolean) =>
    verified ? `${name} · Verified business` : name,
  timeRange: (time: string, hours: number) =>
    `${time} · ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
  AGREED_RATE: 'Agreed rate',
  rate: (rate: string, total: string) =>
    `${rate}/hour · ${total} estimated earnings`,
  WORKPLACE: 'Workplace',
  workplace: (address: string, km: number) => `${address} · ${km} km`,
  VIEW_SHIFT: 'View my shift',
  DIRECTIONS: 'Get directions',
  CANCEL_LINK: 'Cancel shift',
  CANCEL_TITLE: 'Cancel this shift?',
  cancelBody: (window: string) =>
    `Cancellations within ${window} of start are reviewed and may affect your reliability. Emergencies can be reported.`,
  CANCEL_REASON: 'Why are you cancelling?',
  CANCEL_CONFIRM: 'Cancel shift',
  KEEP: 'Keep my shift',
  CANCELLED_TITLE: 'Shift cancelled',
  CANCELLED_BODY: 'The business has been told. You can find new shifts on Discover.',
  OK: 'OK',
} as const;
