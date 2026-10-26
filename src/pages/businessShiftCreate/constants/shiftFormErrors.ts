export const SHIFT_FORM_ERRORS = {
  DATES: 'Select at least one date.',
  LOCATION: 'Enter the work address and set the map pin.',
  ROLE: 'Enter the role.',
  CATEGORY: 'Choose a category.',
  START: 'Choose a start time.',
  END: 'Choose an end time.',
  END_BEFORE_START: 'End time must be after the start time.',
  tooSoon: (hours: number) => `Must start at least ${hours} hours from now.`,
  WORKERS: 'Enter at least 1 worker.',
  PAY: 'Enter the pay per hour.',
  BREAK: 'Enter minutes (0 if none), shorter than the shift.',
  RESPONSIBILITIES: 'Add the responsibilities.',
} as const;
