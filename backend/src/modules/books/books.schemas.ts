import { z } from 'zod';

export const getBooksQuerySchema = z.object({
  search: z.string().trim().optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const bookIdParamSchema = z.object({
  id: z.string().min(1, 'Book ID is required'),
});

export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;
export type BookIdParam = z.infer<typeof bookIdParamSchema>;
