import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { prisma } from './db/prisma-simple.js';

// Load environment variables
config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'KHS CRM Backend' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple auth endpoint for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For now, return a mock token
    if (email === 'admin@khscrm.com' && password === 'admin123') {
      res.json({
        token: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-' + Date.now(),
        user: {
          id: 'admin-id',
          email: 'admin@khscrm.com',
          name: 'Admin User',
          role: 'OWNER'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Simple customers endpoint
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isArchived: false },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            totalCost: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer
app.post('/api/customers', async (req, res) => {
  try {
    const { reference, name, phone, email, address, notes } = req.body;

    let customerReference = reference;
    if (!customerReference) {
      const count = await prisma.customer.count();
      const letter = String.fromCharCode(65 + Math.floor(count / 100));
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
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone, email, address, notes }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    await prisma.customer.update({
      where: { id: req.params.id },
      data: { isArchived: true }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        customer: {
          select: { id: true, reference: true, name: true, address: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create job
app.post('/api/jobs', async (req, res) => {
  try {
    const job = await prisma.job.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        customerId: req.body.customerId,
        status: req.body.status || 'QUOTED',
        priority: req.body.priority || 'medium',
        totalCost: req.body.totalCost || 0,
        depositPaid: req.body.depositPaid || 0,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        notes: req.body.notes
      },
      include: {
        customer: true
      }
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Catch all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Start server
const HOST = '0.0.0.0'; // Important for Render!
app.listen(PORT, HOST, () => {
  });