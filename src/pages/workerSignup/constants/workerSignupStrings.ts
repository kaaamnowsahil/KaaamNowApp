/** UI strings for Worker sign-up (styled after Figma Edit profile 17:152 / 17:668). */
export const WORKER_SIGNUP_STRINGS = {
  TITLE: 'Create your worker profile',
  SUBTITLE: 'Tell businesses who you are and what work you do.',
  NAME_LABEL: 'Full name',
  NAME_PLACEHOLDER: 'Aarav Sharma',
  PHONE_LABEL: 'Phone number',
  PHONE_PLACEHOLDER: '98765 43210',
  EMAIL_LABEL: 'Email (optional)',
  EMAIL_PLACEHOLDER: 'you@example.com',
  AGE_LABEL: 'Age',
  AGE_PLACEHOLDER: '24',
  ADDRESS_LABEL: 'Location',
  ADDRESS_PLACEHOLDER: 'Area, city',
  USE_CURRENT: 'Use current',
  LOCATING: 'Locating…',
  WORK_TYPE_LABEL: 'Work type',
  WORK_TYPE_HINT: 'Pick all that apply.',
  CONTINUE: 'Continue',
} as const;

export const MIN_WORKER_AGE = 18;
export const MAX_WORKER_AGE = 70;
