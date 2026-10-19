export const APPLICATION_SUBMITTED_STRINGS = {
  HEADER_TITLE: 'Worker mode',
  HEADER_TAG: 'Worker',
  overline: (ref: string) => `Applied · ${ref}`,
  HEADING: 'Application submitted',
  subtitle: (business: string) =>
    `${business} received your application. No shift is booked yet.`,
  TRACK: 'Track application',
  BROWSE: 'Browse other shifts',
} as const;
