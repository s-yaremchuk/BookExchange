import { apiClient } from './client';
import type { Book, Paginated } from '../types';

export interface BooksQuery {
  search: string;
  sort: 'asc' | 'desc';
  page: number;
  limit: number;
}

export async function getBooksApi(
  params: BooksQuery,
  signal?: AbortSignal,
): Promise<Paginated<Book>> {
  const response = await apiClient.get<Paginated<Book>>('/books', { params, signal });
  return response.data;
}
