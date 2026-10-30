import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import type { Request, Response } from 'express';

async function main() {
  if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is required');
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  const testUploads = await fs.mkdtemp(path.join(os.tmpdir(), 'book-exchange-tests-'));
  process.env.UPLOADS_DIR = testUploads;
  const { prisma } = await import('../src/lib/prisma');
  const { transporter } = await import('../src/lib/mailer');
  const { createExchangeRequest } = await import('../src/modules/exchange/exchange.service');
  const { deleteMyBook, deleteBookByAdmin } = await import('../src/modules/books/books.service');
  const { deleteUser } = await import('../src/modules/users/users.service');
  const { uploadsDir, saveUploadedFile, removeUploadedFile } = await import('../src/lib/uploads');
  const { cleanupUnusedUploads } = await import('../src/modules/books/uploadCleanup.service');
  const { createMyBookHandler } = await import('../src/modules/books/me-books.controller');
  const originalSend = transporter.sendMail;
  const ids: string[] = [];
  const photos: string[] = [];
  const makePhoto = async () => {
    const photo = await saveUploadedFile({
      mimetype: 'image/png',
      buffer: Buffer.from('fixture'),
    } as Express.Multer.File);
    photos.push(photo);
    return photo;
  };
  const filePath = (url: string) => path.join(uploadsDir, path.basename(url));
  try {
    const owner = await prisma.user.create({
      data: {
        name: 'Owner',
        email: `${crypto.randomUUID()}@example.test`,
        passwordHash: 'fixture',
      },
    });
    const requester = await prisma.user.create({
      data: {
        name: 'Requester',
        email: `${crypto.randomUUID()}@example.test`,
        passwordHash: 'fixture',
      },
    });
    ids.push(owner.id, requester.id);
    await prisma.book.create({
      data: {
        name: 'Offered',
        author: 'Author',
        ownerId: requester.id,
        photoUrl: 'https://example.test/book.jpg',
      },
    });
    const book = await prisma.book.create({
      data: { name: 'Requested', author: 'Author', ownerId: owner.id, photoUrl: await makePhoto() },
    });
    let sent = 0;
    transporter.sendMail = (async () => {
      sent++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { messageId: 'fixture' };
    }) as typeof transporter.sendMail;
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => createExchangeRequest(requester.id, book.id)),
    );
    assert.equal(sent, 1);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    for (const result of results) {
      if (result.status === 'rejected') assert.equal(result.reason.status, 409);
    }
    assert.equal(await prisma.exchangeRequest.count({ where: { bookId: book.id } }), 1);
    await prisma.exchangeRequest.deleteMany({ where: { bookId: book.id } });
    transporter.sendMail = (async () => {
      throw Object.assign(new Error('Connection refused'), { command: 'CONN' });
    }) as typeof transporter.sendMail;
    await assert.rejects(createExchangeRequest(requester.id, book.id));
    assert.equal(await prisma.exchangeRequest.count({ where: { bookId: book.id } }), 0);
    transporter.sendMail = (async () => {
      throw Object.assign(new Error('Timeout'), { command: 'DATA' });
    }) as typeof transporter.sendMail;
    await assert.rejects(createExchangeRequest(requester.id, book.id));
    assert.equal(await prisma.exchangeRequest.count({ where: { bookId: book.id } }), 1);
    await assert.rejects(createExchangeRequest(requester.id, book.id), /pending or unconfirmed/);
    await deleteMyBook(owner.id, book.id);
    await assert.rejects(fs.access(filePath(book.photoUrl)));
    const adminBook = await prisma.book.create({
      data: {
        name: 'Admin removal',
        author: 'Author',
        ownerId: owner.id,
        photoUrl: await makePhoto(),
      },
    });
    await deleteBookByAdmin(adminBook.id);
    await assert.rejects(fs.access(filePath(adminBook.photoUrl)));
    const cascaded = await prisma.book.create({
      data: { name: 'Cascade', author: 'Author', ownerId: owner.id, photoUrl: await makePhoto() },
    });
    await deleteUser(requester.id, owner.id);
    await assert.rejects(fs.access(filePath(cascaded.photoUrl)));
    const orphan = await makePhoto();
    const old = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await fs.utimes(filePath(orphan), old, old);
    const recent = await makePhoto();
    const referenced = await makePhoto();
    await prisma.book.create({
      data: { name: 'Keep photo', author: 'Author', ownerId: requester.id, photoUrl: referenced },
    });
    await fs.utimes(filePath(referenced), old, old);
    await cleanupUnusedUploads();
    await assert.rejects(fs.access(filePath(orphan)));
    await fs.access(filePath(recent));
    await fs.access(filePath(referenced));
    const before = await fs.readdir(testUploads);
    const creationError = await new Promise((resolve) => {
      createMyBookHandler(
        {
          user: { id: crypto.randomUUID(), role: 'USER' },
          body: { name: 'Failure', author: 'Author' },
          file: { mimetype: 'image/png', buffer: Buffer.from('fixture') },
        } as unknown as Request,
        {} as Response,
        resolve,
      );
    });
    assert.ok(creationError);
    assert.deepEqual(await fs.readdir(testUploads), before);
    console.info('Exchange concurrency, SMTP failures and upload cleanup checks passed');
  } finally {
    transporter.sendMail = originalSend;
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await Promise.all(photos.map(removeUploadedFile));
    await prisma.$disconnect();
    await fs.rmdir(testUploads);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
