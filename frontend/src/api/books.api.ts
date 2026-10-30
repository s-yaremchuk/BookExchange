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

export async function getMyBooksApi(signal?: AbortSignal): Promise<Book[]> {
  const response = await apiClient.get<Book[]>('/me/books', { signal });
  return response.data;
}

export async function addBookApi(data: FormData): Promise<Book> {
  const response = await apiClient.post<Book>('/me/books', data, {
    headers: { 'Content-Type': undefined },
  });
  return response.data;
}

export async function deleteMyBookApi(id: string): Promise<void> {
  await apiClient.delete(`/me/books/${encodeURIComponent(id)}`);
}

export async function deleteBookApi(id: string): Promise<void> {
  await apiClient.delete(`/books/${encodeURIComponent(id)}`);
}
