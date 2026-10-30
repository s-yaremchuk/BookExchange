import { apiClient } from './client';
import { User } from '../types';
import { LoginFormValues } from '../schemas/auth.schemas';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function loginApi(data: LoginFormValues): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function registerApi(data: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

export async function getMeApi(signal?: AbortSignal): Promise<User> {
  const response = await apiClient.get<User>('/auth/me', { signal });
  return response.data;
}
