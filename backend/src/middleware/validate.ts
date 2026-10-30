import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

interface Schemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          errors[issue.path.join('.')] = issue.message;
        }
        throw new AppError(400, 'Validation error', errors);
      }
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          errors[issue.path.join('.')] = issue.message;
        }
        throw new AppError(400, 'Validation error', errors);
      }
      req.query = result.data as Record<string, string>;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          errors[issue.path.join('.')] = issue.message;
        }
        throw new AppError(400, 'Validation error', errors);
      }
      req.params = result.data as Record<string, string>;
    }

    next();
  };
