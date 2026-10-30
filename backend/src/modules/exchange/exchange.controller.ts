import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { createExchangeRequest } from './exchange.service';
import { bookIdParamSchema } from '../books/books.schemas';

export const createExchangeRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = bookIdParamSchema.parse(req.params);
  const result = await createExchangeRequest(req.user!.id, id);
  res.status(201).json(result);
});
