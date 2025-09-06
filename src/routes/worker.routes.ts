import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/workers
router.get('/', async (req, res) => {
  res.json({ message: 'Workers list not yet implemented' });
});

// GET /api/workers/tasks
router.get('/tasks', async (req, res) => {
  res.json({ 
    tasks: [],
    message: 'Worker tasks not yet implemented' 
  });
});

export { router as workerRouter };