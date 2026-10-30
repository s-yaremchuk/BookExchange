import { removeUploadedFile } from '../../lib/uploads';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { GetUsersQuery, CreateUserInput, UpdateUserInput } from './users.schemas';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface PaginatedUsers {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getUsersList(query: GetUsersQuery): Promise<PaginatedUsers> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getUserById(id: string): Promise<AdminUserItem> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

export async function createUser(input: CreateUserInput): Promise<AdminUserItem> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, 'Email is already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  currentAdminId: string,
  targetUserId: string,
  input: UpdateUserInput,
): Promise<AdminUserItem> {
  const existing = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  if (currentAdminId === targetUserId && input.role && input.role !== Role.ADMIN) {
    throw new AppError(400, 'Cannot change own admin role');
  }

  if (input.email && input.email !== existing.email) {
    const emailConflict = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (emailConflict) {
      throw new AppError(409, 'Email is already in use');
    }
  }

  const data: {
    name?: string;
    email?: string;
    role?: Role;
    passwordHash?: string;
  } = {};

  if (input.name) data.name = input.name;
  if (input.email) data.email = input.email;
  if (input.role) data.role = input.role;
  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(currentAdminId: string, targetUserId: string): Promise<void> {
  if (currentAdminId === targetUserId) {
    throw new AppError(400, 'Cannot delete own account');
  }

  const existing = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  const deleted = await prisma.user.delete({
    where: { id: targetUserId },
    select: { avatarUrl: true, books: { select: { photoUrl: true } } },
  });
  await Promise.all(deleted.books.map((book) => removeUploadedFile(book.photoUrl)));
  if (deleted.avatarUrl) await removeUploadedFile(deleted.avatarUrl);
}
