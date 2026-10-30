import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
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
