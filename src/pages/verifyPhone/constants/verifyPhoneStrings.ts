/** UI strings for the Verify phone module (Figma 1:120 / 1:152). */
export const VERIFY_PHONE_STRINGS = {
  TITLE: 'Verify your phone',
  subtitle: (maskedPhone: string) => `Enter the 6-digit code sent to ${maskedPhone}.`,
  CODE_LABEL: 'Verification code',
  codeExpiresIn: (time: string) => `Code expires in ${time}.`,
  CODE_EXPIRED: 'Code expired. Request a new one.',
  resendIn: (time: string) => `Resend code available in ${time}.`,
  RESEND_NOW: 'Resend code.',
  NEVER_SHARE: 'Never share your code with anyone, including KaamNow support.',
  VERIFY: 'Verify code',
  CHANGE_PHONE: 'Change phone number',
} as const;

/** Must match backend OTP_TTL_SECONDS / OTP_RESEND_COOLDOWN_SECONDS. */
export const OTP_TTL_SECONDS = 300;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const OTP_LENGTH = 6;
