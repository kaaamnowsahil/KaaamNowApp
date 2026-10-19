import { z } from 'zod';

import {
  addressSchema,
  nameSchema,
  optionalEmailSchema,
} from '@/utils/validation';

export const editProfileSchema = z.object({
  fullName: nameSchema,
  email: optionalEmailSchema,
  age: z
    .string()
    .regex(/^\d{1,2}$/, 'Enter your age in years.')
    .refine(v => Number(v) >= 18 && Number(v) <= 70, 'Age must be 18–70.'),
  address: addressSchema,
  workTypes: z.array(z.string()).min(1, 'Pick at least one work type.'),
});

export type EditProfileForm = z.input<typeof editProfileSchema>;
