import rateLimit from 'express-rate-limit';

// Inline constants to avoid @khs-crm imports
const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
};

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const rateLimiter = (options: RateLimiterOptions = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // 100 requests default
    message: options.message || ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: options.message || ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
        },
      });
    },
  });
};

// Pre-configured limiters for common use cases
export const authLimiter = rateLimiter({ windowMs: 60000, max: 5 }); // 5 per minute
export const apiLimiter = rateLimiter({ windowMs: 60000, max: 100 }); // 100 per minute
export const strictLimiter = rateLimiter({ windowMs: 60000, max: 10 }); // 10 per minute