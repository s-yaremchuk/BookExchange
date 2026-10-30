import { uploadsDir } from './lib/uploads';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { booksRouter } from './modules/books/books.routes';
import { meBooksRouter } from './modules/books/me-books.routes';
import { exchangeRouter } from './modules/exchange/exchange.routes';
import { usersRouter } from './modules/users/users.routes';
import { accountRouter } from './modules/auth/account.routes';

export const app: Express = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/books', exchangeRouter);
app.use('/api/me/books', meBooksRouter);
app.use('/api/users', usersRouter);
app.use('/api', accountRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use(errorHandler);
