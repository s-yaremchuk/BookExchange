import type { BooksQuery } from './books.api';

export const queryKeys = {
  allBooks: ['books'] as const,
  books: (params: BooksQuery) => ['books', params] as const,
  book: (id: string) => ['books', 'detail', id] as const,
};
