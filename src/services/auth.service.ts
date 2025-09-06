import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Inline constants to avoid @khs-crm imports
const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SHORT = '7d';
const REFRESH_TOKEN_EXPIRY_LONG = '30d';

export async function generateTokens(
  user: User,
  rememberMe: boolean = false
): Promise<{ accessToken: string; refreshToken: string }> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate access token
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  // Generate refresh token
  const refreshTokenExpiry = rememberMe ? REFRESH_TOKEN_EXPIRY_LONG : REFRESH_TOKEN_EXPIRY_SHORT;
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    { expiresIn: refreshTokenExpiry }
  );

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Clean up old refresh tokens
  await cleanupExpiredTokens(user.id);

  return { accessToken, refreshToken };
}

export async function verifyRefreshToken(
  token: string
): Promise<{ user: User; storedToken: RefreshToken }> {
  try {
    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!
    ) as { userId: string };

    // Find stored token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new ApiError(401, ERROR_CODES.TOKEN_EXPIRED, 'Refresh token expired');
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, 'User account is disabled');
    }

    return { user: storedToken.user, storedToken };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Refresh token verification failed:', error);
    throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid refresh token');
  }
}

async function cleanupExpiredTokens(userId: string): Promise<void> {
  try {
    const deleted = await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    if (deleted.count > 0) {
      logger.info(`Cleaned up ${deleted.count} expired refresh tokens for user ${userId}`);
    }
  } catch (error) {
    logger.error('Failed to cleanup expired tokens:', error);
  }
}

export function generateResetToken(): string {
  // Generate a secure random token for password reset
  const buffer = Buffer.alloc(32);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer.toString('hex');
}