import { apiClient } from './client';
import type { ExchangeRequestResponse } from '../types';

export async function requestExchangeApi(bookId: string): Promise<ExchangeRequestResponse> {
  const response = await apiClient.post<ExchangeRequestResponse>(
    `/books/${encodeURIComponent(bookId)}/exchange-requests`,
  );
  return response.data;
}
