export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface BookOwner {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  photoUrl: string;
  createdAt: string;
  owner?: BookOwner;
}

export interface BookDetails extends Book {
  owner: BookOwner;
}

export interface ExchangeRequestResponse {
  message: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}
