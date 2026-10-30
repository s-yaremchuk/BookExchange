import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../lib/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication token required');
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AppError(401, 'Authentication token required');
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
