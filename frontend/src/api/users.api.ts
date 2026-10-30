import { apiClient } from './client';
import type { Paginated, User, Role } from '../types';

export interface UserPayload {
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export async function getUsersApi(page: number, signal?: AbortSignal): Promise<Paginated<User>> {
  return (await apiClient.get<Paginated<User>>('/users', { params: { page, limit: 12 }, signal }))
    .data;
}

export async function saveUserApi({ id, data }: { id?: string; data: UserPayload }): Promise<User> {
  return id
    ? (await apiClient.patch<User>(`/users/${encodeURIComponent(id)}`, data)).data
    : (await apiClient.post<User>('/users', data)).data;
}

export async function deleteUserApi(id: string): Promise<void> {
  await apiClient.delete(`/users/${encodeURIComponent(id)}`);
}
