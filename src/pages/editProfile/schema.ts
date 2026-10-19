import { z } from 'zod';

import { addressSchema, nameSchema } from '@/utils/validation';

export const editProfileSchema = z.object({
  fullName: nameSchema,
  address: addressSchema,
  workTypes: z.array(z.string()).min(1, 'Pick at least one work type.'),
});

export type EditProfileForm = z.input<typeof editProfileSchema>;
