export const SHIFT_COMPLETE_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_RIGHT: 'Worker',
  OVERLINE: 'Completed · Attendance submitted',
  HEADING: 'Shift completed',
  subtitle: (name: string, time: string) =>
    `Thanks, ${name}. Your check-out was recorded at ${time}.`,
  hours: (n: number) => `${n} h`,
  RECORDED: 'Recorded time',
  EARNINGS: 'Estimated earnings',
  VIEW_EARNINGS: 'View earnings',
  RATE: 'Rate the business',
} as const;
