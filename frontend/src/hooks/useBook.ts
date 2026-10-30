import { useQuery } from '@tanstack/react-query';
import { getBookApi } from '../api/books.api';
import { queryKeys } from '../api/queryKeys';

export function useBook(id: string) {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: ({ signal }) => getBookApi(id, signal),
    enabled: Boolean(id),
  });
}
