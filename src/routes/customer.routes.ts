import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { prisma } from '../db/prisma.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isArchived: false },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            totalCost: true,
            startDate: true,
            endDate: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: {
          include: {
            materials: true,
            assignments: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const { reference, name, phone, email, address, notes } = req.body;

    // Generate reference if not provided
    let customerReference = reference;
    if (!customerReference) {
      const count = await prisma.customer.count();
      const letter = String.fromCharCode(65 + Math.floor(count / 100)); // A, B, C...
      const number = (count % 100) + 1;
      customerReference = `${letter}${number}`;
    }

    const customer = await prisma.customer.create({
      data: {
        reference: customerReference,
        name,
        phone,
        email,
        address,
        notes
      }
    });

    res.status(201).json(customer);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Customer reference already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        phone,
        email,
        address,
        notes
      }
    });

    res.json(customer);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }
});

// DELETE /api/customers/:id  
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { isArchived: true }
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.status(500).json({ error: 'Failed to archive customer' });
    }
  }
});

// POST /api/customers/sync
router.post('/sync', async (req, res) => {
  try {
    const { customers } = req.body;
    const results = [];

    for (const customer of customers) {
      try {
        if (customer.id && !customer.id.startsWith('temp_')) {
          // Update existing customer
          const updated = await prisma.customer.update({
            where: { id: customer.id },
            data: {
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              notes: customer.notes
            }
          });
          results.push({ id: customer.id, status: 'updated', data: updated });
        } else {
          // Create new customer
          const created = await prisma.customer.create({
            data: {
              reference: customer.reference,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              notes: customer.notes
            }
          });
          results.push({ 
            id: customer.id || customer.localId || customer.reference, 
            status: 'created', 
            data: created 
          });
        }
      } catch (error: any) {
        results.push({ 
          id: customer.id || customer.localId || customer.reference, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

export { router as customerRouter };