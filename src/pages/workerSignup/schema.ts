import { z } from 'zod';

import { toE164India } from '@/utils/phone';

import { MAX_WORKER_AGE, MIN_WORKER_AGE } from './constants';

export const createWorkerSignupSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t('workerSignup.errors.nameMin'))
      .max(80, t('workerSignup.errors.nameMax')),
    phone: z.string().refine(
      digits => toE164India(digits) !== null,
      t('workerSignup.errors.phone'),
    ),
    email: z.union([
      z.literal(''),
      z.string().trim().email(t('workerSignup.errors.email')),
    ]),
    age: z
      .string()
      .regex(/^\d{1,2}$/, t('workerSignup.errors.ageFormat'))
      .refine(
        value => Number(value) >= MIN_WORKER_AGE && Number(value) <= MAX_WORKER_AGE,
        t('workerSignup.errors.ageRange')
          .replace('{{min}}', String(MIN_WORKER_AGE))
          .replace('{{max}}', String(MAX_WORKER_AGE)),
      ),
    address: z.string().trim().min(3, t('workerSignup.errors.address')),
    workTypes: z.array(z.string()).min(1, t('workerSignup.errors.workTypes')),
    password: z
      .string()
      .min(8, t('auth.passwordHint'))
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, t('auth.passwordHint')),
    confirmPassword: z.string().min(1, t('auth.confirmPasswordError')),
  }).refine(value => value.password === value.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type WorkerSignupForm = z.input<ReturnType<typeof createWorkerSignupSchema>>;
