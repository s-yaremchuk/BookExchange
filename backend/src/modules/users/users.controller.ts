import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getUsersList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.service';
import { GetUsersQuery, UserIdParam } from './users.schemas';

export const getUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetUsersQuery;
  const result = await getUsersList(query);
  res.status(200).json(result);
});

export const getUserByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UserIdParam;
  const user = await getUserById(id);
  res.status(200).json(user);
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UserIdParam;
  const user = await updateUser(req.user!.id, id, req.body);
  res.status(200).json(user);
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UserIdParam;
  await deleteUser(req.user!.id, id);
  res.status(204).send();
});
