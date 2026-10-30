import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { registerUser, loginUser, getCurrentUser } from './auth.service';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  res.status(200).json(user);
});
