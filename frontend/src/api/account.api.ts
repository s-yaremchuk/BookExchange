import { apiClient } from './client';
import type { User } from '../types';
export interface Profile extends User {
  avatarUrl: string | null;
  bookCount: number;
  requests: {
    id: string;
    createdAt: string;
    book: { id: string; name: string };
    requester: { name: string; email: string };
  }[];
}
export async function getProfileApi(): Promise<Profile> {
  return (await apiClient.get<Profile>('/me/profile')).data;
}
export async function updateProfileApi(data: {
  name: string;
  email: string;
  avatarUrl?: string | null;
  avatar?: File;
}): Promise<Profile> {
  if (data.avatar) {
    const form = new FormData();
    form.append('name', data.name);
    form.append('email', data.email);
    form.append('avatar', data.avatar);
    return (
      await apiClient.patch<Profile>('/me/profile', form, {
        headers: { 'Content-Type': undefined },
      })
    ).data;
  }
  return (await apiClient.patch<Profile>('/me/profile', data)).data;
}
export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  return (await apiClient.post('/auth/forgot-password', { email })).data;
}
export async function resetPasswordApi(data: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  return (await apiClient.post('/auth/reset-password', data)).data;
}
