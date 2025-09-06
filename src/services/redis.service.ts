import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export async function initializeRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });

  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't throw - allow app to run without Redis in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export function getRedisClient(): RedisClient | null {
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}