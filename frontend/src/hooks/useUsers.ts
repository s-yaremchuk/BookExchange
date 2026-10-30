import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUserApi, getUsersApi, saveUserApi } from '../api/users.api';
import { queryKeys } from '../api/queryKeys';

export function useUsers(page: number) {
  return useQuery({
    queryKey: queryKeys.users(page),
    queryFn: ({ signal }) => getUsersApi(page, signal),
  });
}

export function useUserMutations() {
  const client = useQueryClient();
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: queryKeys.allUsers });
    void client.invalidateQueries({ queryKey: queryKeys.allBooks });
    void client.invalidateQueries({ queryKey: queryKeys.myBooks });
  };
  const save = useMutation({ mutationFn: saveUserApi, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteUserApi, onSuccess: invalidate });
  return { save, remove };
}
