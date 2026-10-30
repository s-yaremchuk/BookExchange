import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { requestExchangeApi } from '../api/exchange.api';
import { queryKeys } from '../api/queryKeys';
import type { ApiErrorResponse } from '../types';

export function useRequestExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestExchangeApi,
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.allBooks });
    },
    onError: (error) => {
      toast.error(
        isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data.message || 'Unable to send exchange request'
          : 'Unable to send exchange request',
      );
    },
  });
}
