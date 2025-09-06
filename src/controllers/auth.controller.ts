import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
// Types defined inline
type Role = 'OWNER' | 'WORKER';
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
}
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY'
};
import { prisma } from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { generateTokens, verifyRefreshToken } from '../services/auth.service.js';

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, rememberMe);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    logger.info(`User ${user.email} logged in successfully`);

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only owners can create new users
    if (req.user?.role !== 'OWNER') {
      throw new ApiError(403, ERROR_CODES.FORBIDDEN, 'Only owners can create new users');
    }

    const { email, password, name, role = 'WORKER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ApiError(409, ERROR_CODES.DUPLICATE_ENTRY, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info(`New user ${user.email} created by ${req.user.email}`);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token
    const { user, storedToken } = await verifyRefreshToken(token);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user,
      storedToken.expiresAt > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Check if long-lived
    );

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Delete all refresh tokens for the user
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.userId },
    });

    logger.info(`User ${req.user!.email} logged out`);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};