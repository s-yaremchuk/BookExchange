import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { saveUploadedFile, removeUploadedFile } from '../../lib/uploads';
import { getMyBooks, createBook, deleteMyBook } from './books.service';
import { createBookSchema, bookIdParamSchema } from './books.schemas';

export const getMyBooksHandler = asyncHandler(async (req: Request, res: Response) => {
  const books = await getMyBooks(req.user!.id);
  res.status(200).json(books);
});

export const createMyBookHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createBookSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join('.')] = issue.message;
    }
    throw new AppError(400, 'Validation error', errors);
  }

  let photoUrl = '';
  if (req.file) {
    photoUrl = await saveUploadedFile(req.file);
  } else if (parsed.data.photoUrl) {
    photoUrl = parsed.data.photoUrl;
  } else {
    throw new AppError(400, 'Either a photo file or photo URL is required', {
      photo: 'Photo file or URL is required',
    });
  }

  try {
    const book = await createBook(req.user!.id, {
      name: parsed.data.name,
      author: parsed.data.author,
      photoUrl,
    });

    res.status(201).json(book);
  } catch (error) {
    if (req.file) await removeUploadedFile(photoUrl);
    throw error;
  }
});

export const deleteMyBookHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = bookIdParamSchema.parse(req.params);
  await deleteMyBook(req.user!.id, id);
  res.status(204).send();
});
