import { prisma } from '../../lib/prisma';
import { sendMail } from '../../lib/mailer';
import { AppError } from '../../utils/AppError';

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
    throw new AppError(409, 'Request already sent');
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

  try {
    await sendMail({
      to: book.owner.email,
      replyTo: requester.email,
      subject: `Book exchange request: "${book.name}"`,
      text: textBody,
      html: htmlBody,
    });
  } catch (err) {
    console.error('Failed to send exchange email:', err);
    throw new AppError(502, 'Failed to send exchange request email');
  }

  await prisma.exchangeRequest.create({
    data: {
      bookId,
      requesterId,
    },
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
