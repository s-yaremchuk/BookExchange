import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { z } from 'zod';

const payloadSchema = z.object({ sub: z.string().uuid(), role: z.nativeEnum(Role) });

export interface JwtPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return payloadSchema.parse(jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }));
}
