import type { BooksQuery } from './books.api';

export const queryKeys = {
  books: (params: BooksQuery) => ['books', params] as const,
};
