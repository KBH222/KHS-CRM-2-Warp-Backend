import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/materials
router.get('/', async (req, res) => {
  res.json({ message: 'Material routes not yet implemented' });
});

// POST /api/materials
router.post('/', async (req, res) => {
  res.json({ message: 'Create material not yet implemented' });
});

// PUT /api/materials/:id
router.put('/:id', async (req, res) => {
  res.json({ message: 'Update material not yet implemented' });
});

// DELETE /api/materials/:id
router.delete('/:id', async (req, res) => {
  res.json({ message: 'Delete material not yet implemented' });
});

// PUT /api/materials/bulk-update
router.put('/bulk-update', async (req, res) => {
  res.json({ message: 'Bulk update materials not yet implemented' });
});

export { router as materialRouter };