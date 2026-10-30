import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { AppError } from '../utils/AppError';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 2 * 1024 * 1024; // 2 MB

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
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

const uploadsDir = path.resolve(__dirname, '../../uploads');

export async function saveUploadedFile(file: Express.Multer.File): Promise<string> {
  if (!fs.existsSync(uploadsDir)) {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);

  return `/uploads/${fileName}`;
}
