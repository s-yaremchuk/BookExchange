import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import multer from 'multer';
import { Prisma } from '@prisma/client';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      message:
        err.code === 'LIMIT_FILE_SIZE' ? 'Photo must not exceed 2 MB' : 'Invalid photo upload',
      errors: {
        photo:
          err.code === 'LIMIT_FILE_SIZE' ? 'Photo must not exceed 2 MB' : 'Invalid photo upload',
      },
    });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ message: 'A record with these details already exists' });
    return;
  }
  if (err instanceof AppError) {
    const body: { message: string; errors?: Record<string, string> } = { message: err.message };
    if (err.errors) body.errors = err.errors;
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.');
      errors[key] = issue.message;
    }
    res.status(400).json({ message: 'Validation error', errors });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
