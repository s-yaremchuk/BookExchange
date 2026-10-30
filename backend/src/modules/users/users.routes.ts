import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  getUsersQuerySchema,
  userIdParamSchema,
  createUserSchema,
  updateUserSchema,
} from './users.schemas';
import {
  getUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from './users.controller';

export const usersRouter: Router = Router();

usersRouter.use(authenticate, authorize(Role.ADMIN));

usersRouter.get('/', validate({ query: getUsersQuerySchema }), getUsersHandler);
usersRouter.post('/', validate({ body: createUserSchema }), createUserHandler);
usersRouter.get('/:id', validate({ params: userIdParamSchema }), getUserByIdHandler);
usersRouter.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  updateUserHandler,
);
usersRouter.delete('/:id', validate({ params: userIdParamSchema }), deleteUserHandler);
