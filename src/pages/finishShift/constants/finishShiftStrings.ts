export const FINISH_SHIFT_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_RIGHT: 'Worker',
  HEADING: 'Finish your shift?',
  SUBTITLE: 'Please check your time before submitting attendance.',
  REVIEW_NOTE:
    'The business reviews payable hours. Any adjustment is visible in your earnings breakdown.',
  NOTE_LABEL: 'Attendance note (optional)',
  CHECKED_IN: 'Checked in',
  CHECK_OUT: 'Check-out time',
  DURATION: 'Recorded duration',
  hours: (n: number) => `${n} ${n === 1 ? 'hour' : 'hours'}`,
  EARNINGS: 'Estimated earnings',
  earnings: (hours: number, rate: string, total: string) =>
    `${hours} × ${rate} = ${total}`,
  CORRECTION_BODY:
    'If this looks wrong, add it to your attendance note. The business can adjust it before approving your hours.',
  OK: 'OK',
  CONFIRM: 'Confirm check-out',
  KEEP_ACTIVE: 'Keep shift active',
} as const;
