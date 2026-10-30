import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { uploadCover } from '../../middleware/upload';
import { getProfile, updateProfile, forgotPassword, resetPassword } from './account.service';

export const accountRouter: Router = Router();
const email = z.string().trim().toLowerCase().email();
const profile = z.object({
  name: z.string().trim().min(2).max(50),
  email,
  avatarUrl: z
    .string()
    .refine(
      (value) =>
        /^\/uploads\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i.test(value) ||
        (z.string().url().safeParse(value).success && /^https?:\/\//i.test(value)),
    )
    .nullable()
    .optional(),
});
accountRouter.get(
  '/me/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(await getProfile(req.user!.id));
  }),
);
accountRouter.patch(
  '/me/profile',
  authenticate,
  uploadCover.single('avatar'),
  asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (body.avatarUrl === '') body.avatarUrl = null;
    if (req.file) delete body.avatarUrl;
    res.json(await updateProfile(req.user!.id, profile.parse(body), req.file));
  }),
);
accountRouter.post(
  '/auth/forgot-password',
  validate({ body: z.object({ email }) }),
  asyncHandler(async (req, res) => {
    await forgotPassword(req.body.email);
    res.json({ message: 'If an account exists, a reset link will be sent to its email.' });
  }),
);
accountRouter.post(
  '/auth/reset-password',
  validate({
    body: z.object({
      token: z.string().regex(/^[a-f0-9]{64}$/),
      password: z.string().min(8).max(72),
    }),
  }),
  asyncHandler(async (req, res) => {
    await resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password updated' });
  }),
);
