export const RATE_BUSINESS_STRINGS = {
  heading: (business: string) => `Rate ${business}`,
  SUBTITLE: 'Your feedback keeps KaamNow safe and fair.',
  businessMeta: (verified: boolean, role: string) =>
    verified ? `Verified business · ${role}` : role,
  starLabel: (n: number) => `${n} ${n === 1 ? 'star' : 'stars'}`,
  RATING_LABEL: [
    'Tap a star to rate',
    'Poor',
    'Could be better',
    'Good',
    'Great experience',
    'Excellent',
  ],
  WENT_WELL: 'What went well?',
  COMMENT_PLACEHOLDER: 'Share more about your shift (optional)',
  SUBMIT: 'Submit rating',
  SKIP: 'Skip for now',
} as const;
