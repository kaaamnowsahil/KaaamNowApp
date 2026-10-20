import { z } from 'zod';

export const createEditProfileSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t('editProfile.errors.nameMin'))
      .max(80, t('editProfile.errors.nameMax')),
    address: z.string().trim().min(3, t('editProfile.errors.address')),
    workTypes: z.array(z.string()).min(1, t('editProfile.errors.workTypes')),
  });

export type EditProfileForm = z.input<ReturnType<typeof createEditProfileSchema>>;
