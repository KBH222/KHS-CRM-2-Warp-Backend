import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Log Prisma events
prisma.$on('query' as never, (e: any) => {
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Query:', e);
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma error:', e);
});

prisma.$on('info' as never, (e: any) => {
  logger.info('Prisma info:', e);
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma warning:', e);
});