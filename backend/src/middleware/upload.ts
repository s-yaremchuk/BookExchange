import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/AppError';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 2 * 1024 * 1024; // 2 MB

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only JPEG, PNG and WebP images are allowed'));
  }
};

export const uploadCover = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});
