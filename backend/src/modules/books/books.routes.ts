import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { getBooksQuerySchema, bookIdParamSchema } from './books.schemas';
import { getBooksHandler, getBookByIdHandler } from './books.controller';

export const booksRouter: Router = Router();

booksRouter.get('/', authenticate, validate({ query: getBooksQuerySchema }), getBooksHandler);
booksRouter.get('/:id', authenticate, validate({ params: bookIdParamSchema }), getBookByIdHandler);
