import { z } from 'zod';

export const getBooksQuerySchema = z.object({
  search: z.string().trim().optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const bookIdParamSchema = z.object({
  id: z.string().uuid('Invalid book ID'),
});

export const createBookSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(150, 'Name must not exceed 150 characters'),
  author: z
    .string()
    .trim()
    .min(1, 'Author is required')
    .max(150, 'Author must not exceed 150 characters'),
  photoUrl: z
    .string()
    .trim()
    .refine(
      (val) => !val || (z.string().url().safeParse(val).success && /^https?:\/\//i.test(val)),
      {
        message: 'Photo URL must be a valid HTTP or HTTPS URL',
      },
    )
    .optional(),
});

export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;
export type BookIdParam = z.infer<typeof bookIdParamSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
