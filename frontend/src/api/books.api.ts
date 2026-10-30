import { apiClient } from './client';
import type { Book, BookDetails, Paginated } from '../types';

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

export async function getBookApi(id: string, signal?: AbortSignal): Promise<BookDetails> {
  const response = await apiClient.get<BookDetails>(`/books/${encodeURIComponent(id)}`, { signal });
  return response.data;
}
