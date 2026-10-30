import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { booksRouter } from './modules/books/books.routes';
import { meBooksRouter } from './modules/books/me-books.routes';
import { exchangeRouter } from './modules/exchange/exchange.routes';

export const app: Express = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/books', exchangeRouter);
app.use('/api/me/books', meBooksRouter);

app.use(errorHandler);
