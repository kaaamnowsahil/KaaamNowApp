import { z } from 'zod';

import {
  addressSchema,
  nameSchema,
  optionalEmailSchema,
  phoneSchema,
} from '@/utils/validation';

import { MAX_WORKER_AGE, MIN_WORKER_AGE } from './constants';

export const workerSignupSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  age: z
    .string()
    .regex(/^\d{1,2}$/, 'Enter your age in years.')
    .refine(
      v => Number(v) >= MIN_WORKER_AGE && Number(v) <= MAX_WORKER_AGE,
      `Age must be between ${MIN_WORKER_AGE} and ${MAX_WORKER_AGE}.`,
    ),
  address: addressSchema,
  workTypes: z.array(z.string()).min(1, 'Pick at least one work type.'),
});

export type WorkerSignupForm = z.input<typeof workerSignupSchema>;
