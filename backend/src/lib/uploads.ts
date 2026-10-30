import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { env } from '../config/env';

export const uploadsDir = path.resolve(__dirname, '../..', env.UPLOADS_DIR);

export async function saveUploadedFile(file: Express.Multer.File): Promise<string> {
  await fs.mkdir(uploadsDir, { recursive: true });
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  const name = `${crypto.randomUUID()}${extensions[file.mimetype]}`;
  await fs.writeFile(path.join(uploadsDir, name), file.buffer);
  return `/uploads/${name}`;
}

export async function removeUploadedFile(photoUrl: string): Promise<void> {
  if (!/^\/uploads\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/i.test(photoUrl)) return;
  const target = path.resolve(uploadsDir, path.basename(photoUrl));
  if (path.dirname(target) !== uploadsDir) return;
  try {
    await fs.rm(target, { force: true });
  } catch (error) {
    console.error('Upload cleanup deferred:', error);
  }
}
