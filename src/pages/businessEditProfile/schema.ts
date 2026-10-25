import { z } from 'zod';

export const createBusinessEditProfileSchema = (t: (key: string) => string) =>
    z.object({
        businessName: z
            .string()
            .trim()
            .min(2, t('businessSignup.errors.nameMin'))
            .max(80, t('businessSignup.errors.nameMax')),
        address: z.string().trim().min(3, t('businessSignup.errors.address')),
        businessTypes: z
            .array(z.string())
            .min(1, t('businessSignup.errors.businessType'))
            .max(10),
    });

export type BusinessEditProfileForm = z.input<
    ReturnType<typeof createBusinessEditProfileSchema>
>;
