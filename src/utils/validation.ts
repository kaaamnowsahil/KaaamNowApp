import { z } from 'zod';

import { toE164India } from './phone';

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Enter at least 2 characters.')
  .max(80);

export const phoneSchema = z
  .string()
  .refine(
    digits => toE164India(digits) !== null,
    'Enter a valid 10-digit mobile number.',
  );

/** Optional: empty string is allowed. */
export const optionalEmailSchema = z.union([
  z.literal(''),
  z.string().trim().email('Enter a valid email or leave it empty.'),
]);

export const addressSchema = z
  .string()
  .trim()
  .min(3, 'Add your address or use current location.');

/** First error message per field, for showing under inputs. */
export const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    out[key] ??= issue.message;
  }
  return out;
};
