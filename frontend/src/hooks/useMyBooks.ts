import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBookApi, deleteMyBookApi, getMyBooksApi } from '../api/books.api';
import { queryKeys } from '../api/queryKeys';

export function useMyBooks() {
  return useQuery({
    queryKey: queryKeys.myBooks,
    queryFn: ({ signal }) => getMyBooksApi(signal),
  });
}

function useInvalidateBooks() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.myBooks });
    void queryClient.invalidateQueries({ queryKey: queryKeys.allBooks });
  };
}

export function useAddBook() {
  const invalidateBooks = useInvalidateBooks();
  return useMutation({ mutationFn: addBookApi, onSuccess: invalidateBooks });
}

export function useDeleteMyBook() {
  const invalidateBooks = useInvalidateBooks();
  return useMutation({ mutationFn: deleteMyBookApi, onSuccess: invalidateBooks });
}
