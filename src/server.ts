import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { customerRouter } from './routes/customer.routes.js';
import { jobRouter } from './routes/job.routes.js';
import { materialRouter } from './routes/material.routes.js';
import { syncRouter } from './routes/sync.routes.js';
import { workerRouter } from './routes/worker.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { logger } from './utils/logger.js';
import { initializeRedis } from './services/redis.service.js';
import { startSyncProcessor } from './services/sync.service.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/materials', materialRouter);
app.use('/api/sync', syncRouter);
app.use('/api/workers', workerRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connected successfully');

    // Start sync processor
    startSyncProcessor();
    logger.info('Sync processor started');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();