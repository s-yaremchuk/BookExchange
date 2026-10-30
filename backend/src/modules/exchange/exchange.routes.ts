import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { bookIdParamSchema } from '../books/books.schemas';
import { createExchangeRequestHandler } from './exchange.controller';

export const exchangeRouter: Router = Router();

exchangeRouter.post(
  '/:id/exchange-requests',
  authenticate,
  validate({ params: bookIdParamSchema }),
  createExchangeRequestHandler,
);
