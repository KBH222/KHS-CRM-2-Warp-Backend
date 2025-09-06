import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  res.json({ 
    activeJobs: 0,
    completedJobsThisWeek: 0,
    pendingMaterials: 0,
    assignedWorkers: 0,
    message: 'Dashboard stats not yet implemented'
  });
});

export { router as dashboardRouter };