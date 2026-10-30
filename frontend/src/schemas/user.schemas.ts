import { z } from 'zod';

export const userFormSchema = (isEditing: boolean) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    role: z.enum(['USER', 'ADMIN']),
    password: z
      .string()
      .refine(
        (value) => (isEditing && value === '') || value.length >= 8,
        'Password must be at least 8 characters',
      ),
  });

export type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>;
