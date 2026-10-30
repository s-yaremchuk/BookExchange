import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../lib/prisma';
import { removeUploadedFile, uploadsDir } from '../../lib/uploads';

const CLEANUP_INTERVAL = 60 * 60 * 1000;

export async function cleanupUnusedUploads(): Promise<void> {
  await fs.mkdir(uploadsDir, { recursive: true });
  const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/^[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/i.test(entry.name)) continue;
    const file = path.resolve(uploadsDir, entry.name);
    if (path.dirname(file) !== uploadsDir) continue;
    let modified: number;
    try {
      modified = (await fs.stat(file)).mtimeMs;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT')
        continue;
      throw error;
    }
    if (Date.now() - modified < CLEANUP_INTERVAL) continue;
    const photoUrl = `/uploads/${entry.name}`;
    const references = await prisma.book.count({ where: { photoUrl } });
    const avatars = await prisma.user.count({ where: { avatarUrl: photoUrl } });
    if (references === 0 && avatars === 0) await removeUploadedFile(photoUrl);
  }
}

export function scheduleUploadCleanup(): void {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await cleanupUnusedUploads();
    } catch (error) {
      console.error('Upload cleanup failed:', error);
    } finally {
      running = false;
    }
  };
  void run();
  setInterval(() => void run(), CLEANUP_INTERVAL).unref();
}
