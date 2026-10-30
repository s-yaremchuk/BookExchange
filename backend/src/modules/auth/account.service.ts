import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { sendMail } from '../../lib/mailer';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { saveUploadedFile, removeUploadedFile } from '../../lib/uploads';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function getProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      _count: { select: { books: true } },
    },
  });
  if (!user) throw new AppError(404, 'User not found');
  const requests = await prisma.exchangeRequest.findMany({
    where: { book: { ownerId: id }, deliveryStatus: 'SENT' },
    select: {
      id: true,
      createdAt: true,
      book: { select: { id: true, name: true } },
      requester: { select: { name: true, email: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  });
  return { ...user, bookCount: user._count.books, requests };
}

export async function updateProfile(
  id: string,
  data: { name: string; email: string; avatarUrl?: string | null },
  file?: Express.Multer.File,
) {
  const previous = await prisma.user.findUnique({ where: { id }, select: { avatarUrl: true } });
  if (!previous) throw new AppError(404, 'User not found');
  if (data.avatarUrl?.startsWith('/uploads/') && data.avatarUrl !== previous.avatarUrl) {
    throw new AppError(400, 'Invalid avatar URL');
  }
  const uploaded = file ? await saveUploadedFile(file) : undefined;
  const avatarUrl = uploaded ?? data.avatarUrl;
  try {
    await prisma.user.update({ where: { id }, data: { ...data, avatarUrl } });
  } catch (error) {
    if (uploaded) await removeUploadedFile(uploaded);
    throw error;
  }
  if (avatarUrl !== undefined && previous.avatarUrl && previous.avatarUrl !== avatarUrl) {
    await removeUploadedFile(previous.avatarUrl);
  }
  return getProfile(id);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, resetTokenExpiresAt: true },
  });
  if (
    !user ||
    (user.resetTokenExpiresAt && user.resetTokenExpiresAt.getTime() > Date.now() + 55 * 60 * 1000)
  )
    return;
  const token = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = hashToken(token);
  const claimed = await prisma.user.updateMany({
    where: {
      id: user.id,
      OR: [
        { resetTokenExpiresAt: null },
        { resetTokenExpiresAt: { lte: new Date(Date.now() + 55 * 60 * 1000) } },
      ],
    },
    data: { resetTokenHash, resetTokenExpiresAt: new Date(Date.now() + 3600000) },
  });
  if (!claimed.count) return;
  const link = new URL('/reset-password', env.CLIENT_URL);
  link.searchParams.set('token', token);
  try {
    await sendMail({
      to: email,
      replyTo: env.MAIL_FROM,
      subject: 'Reset your password',
      text: `Reset your password: ${link.href}\nThis link expires in one hour.`,
      html: `<p><a href="${link.href}">Reset your password</a></p><p>This link expires in one hour.</p>`,
    });
  } catch {
    await prisma.user.updateMany({
      where: { id: user.id, resetTokenHash },
      data: { resetTokenHash: null, resetTokenExpiresAt: null },
    });
  }
}

export async function resetPassword(token: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await prisma.user.updateMany({
    where: { resetTokenHash: hashToken(token), resetTokenExpiresAt: { gt: new Date() } },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });
  if (!result.count) throw new AppError(400, 'Invalid or expired reset link');
}
