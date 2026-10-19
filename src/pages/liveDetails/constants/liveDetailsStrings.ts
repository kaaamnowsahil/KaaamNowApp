export const LIVE_DETAILS_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_RIGHT: 'Worker',
  liveStatus: (spots: number) =>
    `Live · ${spots} ${spots === 1 ? 'spot' : 'spots'} available`,
  businessMeta: (verified: boolean, rating: number, reviews: number) =>
    `${verified ? 'Verified business · ' : ''}${rating} (${reviews} reviews)`,
  rate: (rate: string) => `${rate}/hr`,
  AGREED_RATE: 'Agreed rate',
  ESTIMATED: 'Estimated earnings',
  when: (date: string, time: string) => `${date} · ${time}`,
  duration: (hours: number, startsIn: string) =>
    `${hours} ${hours === 1 ? 'hour' : 'hours'} · ${startsIn}`,
  where: (place: string, km: number) => `${place} · ${km} km`,
  WHAT_YOU_DO: 'What you’ll do',
  BEFORE_ACCEPT: 'Before you accept',
  CANCELLATION: 'Cancellation policy',
  accept: (rate: string) => `Accept shift · ${rate}/hour`,
  MESSAGE: 'Message business',
} as const;
