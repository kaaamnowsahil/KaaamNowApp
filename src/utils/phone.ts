export const PHONE_DIGITS = 10;

/** Keeps the 10 local digits; strips a pasted +91 / 91 / 0 prefix. */
export const toLocalDigits = (input: string): string => {
  let digits = input.replace(/\D/g, '');
  if (digits.length > PHONE_DIGITS) {
    digits = digits.replace(/^(91|0)/, '');
  }
  return digits.slice(0, PHONE_DIGITS);
};

/** "9876543210" -> "98765 43210" */
export const formatLocalPhone = (digits: string): string =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

/** Valid Indian mobile: 10 digits starting 6-9. */
export const toE164India = (digits: string): string | null =>
  /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
