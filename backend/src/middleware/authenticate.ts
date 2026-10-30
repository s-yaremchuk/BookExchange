import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../lib/jwt';
import { getCurrentUser } from '../modules/auth/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token required');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError(401, 'Authentication token required');
    }

    let userId: string;
    try {
      userId = verifyToken(token).sub;
    } catch {
      throw new AppError(401, 'Invalid or expired token');
    }
    const user = await getCurrentUser(userId);
    req.user = { id: user.id, role: user.role };
    next();
  },
);
