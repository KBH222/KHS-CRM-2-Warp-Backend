import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sync/status
router.get('/status', async (req, res) => {
  res.json({ 
    lastSyncAt: null,
    pendingOperations: 0,
    syncInProgress: false,
    errors: []
  });
});

// POST /api/sync/push
router.post('/push', async (req, res) => {
  res.json({ message: 'Sync push not yet implemented' });
});

// POST /api/sync/pull
router.post('/pull', async (req, res) => {
  res.json({ message: 'Sync pull not yet implemented' });
});

export { router as syncRouter };