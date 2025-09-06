import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import * as authController from '../controllers/auth.controller.js';

// Inline constants to avoid @khs-crm imports
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
} as const;

export const authRouter = Router();

// Login with rate limiting
authRouter.post(
  '/login',
  rateLimiter({ windowMs: 60000, max: 5 }), // 5 attempts per minute
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('rememberMe').optional().isBoolean(),
  ],
  validateRequest,
  authController.login
);

// Register (only authenticated owners can create new users)
authRouter.post(
  '/register',
  authenticate,
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
      .matches(VALIDATION.PASSWORD_PATTERN)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('role').optional().isIn(['OWNER', 'WORKER']),
  ],
  validateRequest,
  authController.register
);

// Refresh token
authRouter.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  validateRequest,
  authController.refreshToken
);

// Logout
authRouter.post('/logout', authenticate, authController.logout);

// Get current user
authRouter.get('/me', authenticate, authController.getCurrentUser);