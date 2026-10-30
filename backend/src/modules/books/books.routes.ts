import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { getBooksQuerySchema, bookIdParamSchema } from './books.schemas';
import {
  getBooksHandler,
  getBookByIdHandler,
  deleteBookByAdminHandler,
} from './books.controller';

export const booksRouter: Router = Router();

booksRouter.get('/', authenticate, validate({ query: getBooksQuerySchema }), getBooksHandler);
booksRouter.get('/:id', authenticate, validate({ params: bookIdParamSchema }), getBookByIdHandler);
booksRouter.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: bookIdParamSchema }),
  deleteBookByAdminHandler,
);
