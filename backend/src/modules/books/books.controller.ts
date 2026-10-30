import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getBooksCatalog, getBookById, deleteBookByAdmin } from './books.service';
import { GetBooksQuery, BookIdParam } from './books.schemas';

export const getBooksHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetBooksQuery;
  const result = await getBooksCatalog(query);
  res.status(200).json(result);
});

export const getBookByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as BookIdParam;
  const book = await getBookById(id);
  res.status(200).json(book);
});

export const deleteBookByAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as BookIdParam;
  await deleteBookByAdmin(id);
  res.status(204).send();
});
