import { Request, Response, NextFunction } from 'express';
// Constants defined inline
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY'
};
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
  DEFAULT: 'An error occurred'
};
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user?.userId,
  });

  // Handle known error types
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: ERROR_CODES.DUPLICATE_ENTRY,
          message: 'This item already exists',
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Record not found',
        },
      });
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
        details: err.message,
      },
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? ERROR_MESSAGES.DEFAULT 
        : err.message,
    },
  });
};