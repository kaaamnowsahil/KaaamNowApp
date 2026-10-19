import { z } from 'zod';

import {
  addressSchema,
  nameSchema,
  optionalEmailSchema,
  phoneSchema,
} from '@/utils/validation';

export const businessSignupSchema = z.object({
  businessName: nameSchema,
  contactName: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  address: addressSchema,
  businessType: z.string().min(1, 'Pick your business type.'),
});

export type BusinessSignupForm = z.input<typeof businessSignupSchema>;
