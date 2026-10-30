import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { uploadCover } from '../../middleware/upload';
import { bookIdParamSchema } from './books.schemas';
import { getMyBooksHandler, createMyBookHandler, deleteMyBookHandler } from './me-books.controller';

export const meBooksRouter: Router = Router();

meBooksRouter.use(authenticate);

meBooksRouter.get('/', getMyBooksHandler);
meBooksRouter.post('/', uploadCover.single('photo'), createMyBookHandler);
meBooksRouter.delete('/:id', validate({ params: bookIdParamSchema }), deleteMyBookHandler);
