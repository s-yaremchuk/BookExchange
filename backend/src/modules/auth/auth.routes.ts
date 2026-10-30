import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema } from './auth.schemas';
import { registerHandler, loginHandler, getMeHandler } from './auth.controller';

export const authRouter: Router = Router();

authRouter.post('/register', validate({ body: registerSchema }), registerHandler);
authRouter.post('/login', validate({ body: loginSchema }), loginHandler);
authRouter.get('/me', authenticate, getMeHandler);
