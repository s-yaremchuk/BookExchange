import { useQuery } from '@tanstack/react-query';
import { getBooksApi, type BooksQuery } from '../api/books.api';
import { queryKeys } from '../api/queryKeys';

export function useBooks(params: BooksQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.books(params),
    queryFn: ({ signal }) => getBooksApi(params, signal),
    enabled,
  });
}
