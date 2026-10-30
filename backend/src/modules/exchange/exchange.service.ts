import { prisma } from '../../lib/prisma';
import { sendMail } from '../../lib/mailer';
import { AppError } from '../../utils/AppError';
import { Prisma } from '@prisma/client';

export async function createExchangeRequest(
  requesterId: string,
  bookId: string,
): Promise<{ message: string }> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      name: true,
      author: true,
      ownerId: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  if (book.ownerId === requesterId) {
    throw new AppError(400, 'You cannot request your own book');
  }

  const requesterBooks = await prisma.book.findMany({
    where: { ownerId: requesterId },
    select: {
      name: true,
      author: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (requesterBooks.length === 0) {
    throw new AppError(400, 'Add at least one book before requesting an exchange');
  }

  const existingRequest = await prisma.exchangeRequest.findUnique({
    where: {
      bookId_requesterId: {
        bookId,
        requesterId,
      },
    },
  });

  if (existingRequest) {
    throw new AppError(
      409,
      existingRequest.deliveryStatus === 'SENT'
        ? 'Request already sent'
        : 'Request delivery is pending or unconfirmed',
    );
  }

  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: {
      name: true,
      email: true,
    },
  });

  if (!requester) {
    throw new AppError(404, 'User not found');
  }

  const booksListText = requesterBooks
    .map((b, index) => `${index + 1}. "${b.name}" by ${b.author}`)
    .join('\n');

  const booksListHtml = requesterBooks
    .map((b) => `<li><strong>${escapeHtml(b.name)}</strong> by ${escapeHtml(b.author)}</li>`)
    .join('');

  const textBody = `Hello ${book.owner.name},

${requester.name} (${requester.email}) wants to exchange books with you for "${book.name}" by ${book.author}.

Books offered for exchange:
${booksListText}

You can reply directly to this email to coordinate the exchange.`;

  const htmlBody = `<p>Hello ${escapeHtml(book.owner.name)},</p>
<p><strong>${escapeHtml(requester.name)}</strong> (<a href="mailto:${escapeHtml(requester.email)}">${escapeHtml(requester.email)}</a>) wants to exchange books with you for <strong>"${escapeHtml(book.name)}"</strong> by ${escapeHtml(book.author)}.</p>
<p>Books offered for exchange:</p>
<ol>
${booksListHtml}
</ol>
<p>You can reply directly to this email to coordinate the exchange.</p>`;

  let requestId: string;
  try {
    const request = await prisma.exchangeRequest.create({
      data: { bookId, requesterId, deliveryStatus: 'PENDING' },
    });
    requestId = request.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Request already sent or in progress');
    }
    throw error;
  }

  try {
    await sendMail({
      to: book.owner.email,
      replyTo: requester.email,
      subject: `Book exchange request: "${book.name}"`,
      text: textBody,
      html: htmlBody,
    });
  } catch (err) {
    const definitelyRejected =
      typeof err === 'object' &&
      err !== null &&
      (('responseCode' in err && typeof err.responseCode === 'number' && err.responseCode >= 400) ||
        ('command' in err &&
          typeof err.command === 'string' &&
          ['CONN', 'EHLO', 'HELO', 'AUTH', 'MAIL FROM', 'RCPT TO'].includes(err.command)));
    if (definitelyRejected) {
      await prisma.exchangeRequest.delete({ where: { id: requestId } });
    }
    throw new AppError(
      502,
      definitelyRejected
        ? 'Failed to send exchange request email. Please try again.'
        : 'Email delivery could not be confirmed. The request is saved to prevent duplicate emails.',
    );
  }

  await prisma.exchangeRequest.update({
    where: { id: requestId },
    data: { deliveryStatus: 'SENT' },
  });

  return { message: 'Request sent' };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
