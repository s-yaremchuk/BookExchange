import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { GetBooksQuery } from './books.schemas';

export interface BookOwner {
  id: string;
  name: string;
}

export interface BookItem {
  id: string;
  name: string;
  author: string;
  photoUrl: string;
  createdAt: Date;
  owner: BookOwner;
}

export interface PaginatedBooks {
  items: BookItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getBooksCatalog(query: GetBooksQuery): Promise<PaginatedBooks> {
  const { search, sort, page, limit } = query;

  const where: Prisma.BookWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      select: {
        id: true,
        name: true,
        author: true,
        photoUrl: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ name: sort }, { id: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
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

export async function getBookById(id: string): Promise<BookItem> {
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      author: true,
      photoUrl: true,
      createdAt: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  return book;
}

export interface MyBookItem {
  id: string;
  name: string;
  author: string;
  photoUrl: string;
  createdAt: Date;
}

export async function getMyBooks(ownerId: string): Promise<MyBookItem[]> {
  return prisma.book.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      author: true,
      photoUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createBook(
  ownerId: string,
  data: { name: string; author: string; photoUrl: string },
): Promise<MyBookItem> {
  return prisma.book.create({
    data: {
      name: data.name,
      author: data.author,
      photoUrl: data.photoUrl,
      ownerId,
    },
    select: {
      id: true,
      name: true,
      author: true,
      photoUrl: true,
      createdAt: true,
    },
  });
}

export async function deleteMyBook(ownerId: string, bookId: string): Promise<void> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { ownerId: true },
  });

  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  if (book.ownerId !== ownerId) {
    throw new AppError(403, 'You do not have permission to delete this book');
  }

  await prisma.book.delete({
    where: { id: bookId },
  });
}

export async function deleteBookByAdmin(id: string): Promise<void> {
  const book = await prisma.book.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  await prisma.book.delete({
    where: { id },
  });
}
