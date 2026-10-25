import { z } from 'zod';

import { toE164India } from '@/utils/phone';

export const MAX_BUSINESS_TYPES = 10;

export const createBusinessSignupSchema = (t: (key: string) => string) =>
  z.object({
    businessName: z
      .string()
      .trim()
      .min(2, t('businessSignup.errors.nameMin'))
      .max(80, t('businessSignup.errors.nameMax')),
    contactName: z
      .string()
      .trim()
      .min(2, t('businessSignup.errors.nameMin'))
      .max(80, t('businessSignup.errors.nameMax')),
    phone: z.string().refine(
      digits => toE164India(digits) !== null,
      t('businessSignup.errors.phone'),
    ),
    email: z.union([
      z.literal(''),
      z.string().trim().email(t('businessSignup.errors.email')),
    ]),
    address: z.string().trim().min(3, t('businessSignup.errors.address')),
    businessTypes: z
      .array(z.string())
      .min(1, t('businessSignup.errors.businessType'))
      .max(MAX_BUSINESS_TYPES, t('businessSignup.errors.maxBusinessTypes')),
    password: z
      .string()
      .min(8, t('auth.passwordHint'))
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, t('auth.passwordHint')),
    confirmPassword: z.string().min(1, t('auth.confirmPasswordError')),
  }).refine(value => value.password === value.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type BusinessSignupForm = z.input<
  ReturnType<typeof createBusinessSignupSchema>
>;
