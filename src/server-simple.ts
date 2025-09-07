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

// Auth check endpoints (mock responses)
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'admin-id',
    email: 'admin@khscrm.com',
    name: 'Admin User',
    role: 'OWNER'
  });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ authenticated: true });
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
      const letter = String.fromCharCode(65 + Math.floor(count / 100)); // A, B, C...
      const number = (count % 100) + 1;
      customerReference = `${letter}${number.toString().padStart(2, '0')}`; // A01, A02, B01...
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
        notes: req.body.notes,
        tasks: req.body.tasks ? JSON.stringify(req.body.tasks) : null,
        photos: req.body.photos ? JSON.stringify(req.body.photos) : null,
        plans: req.body.plans ? JSON.stringify(req.body.plans) : null
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

// Update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        totalCost: req.body.totalCost,
        depositPaid: req.body.depositPaid,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        notes: req.body.notes,
        tasks: req.body.tasks ? JSON.stringify(req.body.tasks) : null,
        photos: req.body.photos ? JSON.stringify(req.body.photos) : null,
        plans: req.body.plans ? JSON.stringify(req.body.plans) : null
      },
      include: {
        customer: true
      }
    });
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: { id: true, reference: true, name: true, address: true }
        },
        materials: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Parse JSON fields
    const jobWithParsedFields = {
      ...job,
      tasks: job.tasks ? JSON.parse(job.tasks) : [],
      photos: job.photos ? JSON.parse(job.photos) : [],
      plans: job.plans ? JSON.parse(job.plans) : []
    };
    
    res.json(jobWithParsedFields);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Get all workers
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Create worker
app.post('/api/workers', async (req, res) => {
  try {
    const worker = await prisma.worker.create({
      data: {
        name: req.body.name,
        fullName: req.body.fullName || req.body.name,
        phone: req.body.phone || '',
        email: req.body.email || '',
        specialty: req.body.specialty || 'General',
        status: req.body.status || 'Available',
        color: req.body.color || '#3B82F6'
      }
    });
    res.status(201).json(worker);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

// Get all tool categories
app.get('/api/tools/categories', async (req, res) => {
  try {
    const categories = await prisma.toolCategory.findMany({
      include: {
        toolLists: {
          include: {
            items: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching tool categories:', error);
    res.status(500).json({ error: 'Failed to fetch tool categories' });
  }
});

// Get KHS Tools sync data
app.get('/api/khs-tools-sync', async (req, res) => {
  try {
    const syncData = await prisma.kHSToolsSync.findFirst({
      where: { id: 'main' }
    });
    
    if (!syncData) {
      // Return default empty state
      res.json({
        id: 'main',
        tools: {},
        selectedDemoCategories: [],
        selectedInstallCategories: [],
        lockedCategories: [],
        showDemo: false,
        showInstall: false,
        version: 1
      });
    } else {
      res.json(syncData);
    }
  } catch (error) {
    console.error('Error fetching KHS tools sync:', error);
    res.status(500).json({ error: 'Failed to fetch KHS tools sync' });
  }
});

// Update KHS Tools sync data
app.post('/api/khs-tools-sync', async (req, res) => {
  try {
    const syncData = await prisma.kHSToolsSync.upsert({
      where: { id: 'main' },
      update: {
        tools: req.body.tools || {},
        selectedDemoCategories: req.body.selectedDemoCategories || [],
        selectedInstallCategories: req.body.selectedInstallCategories || [],
        lockedCategories: req.body.lockedCategories || [],
        showDemo: req.body.showDemo || false,
        showInstall: req.body.showInstall || false,
        lastUpdatedBy: 'admin-id',
        version: { increment: 1 }
      },
      create: {
        id: 'main',
        tools: req.body.tools || {},
        selectedDemoCategories: req.body.selectedDemoCategories || [],
        selectedInstallCategories: req.body.selectedInstallCategories || [],
        lockedCategories: req.body.lockedCategories || [],
        showDemo: req.body.showDemo || false,
        showInstall: req.body.showInstall || false,
        lastUpdatedBy: 'admin-id',
        version: 1
      }
    });
    res.json(syncData);
  } catch (error) {
    console.error('Error updating KHS tools sync:', error);
    res.status(500).json({ error: 'Failed to update KHS tools sync' });
  }
});

// Get schedule events
app.get('/api/schedule', async (req, res) => {
  try {
    const events = await prisma.scheduleEvent.findMany({
      include: {
        customer: {
          select: { id: true, name: true, reference: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    res.status(500).json({ error: 'Failed to fetch schedule events' });
  }
});

// Create schedule event
app.post('/api/schedule', async (req, res) => {
  try {
    const event = await prisma.scheduleEvent.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        eventType: req.body.eventType || 'work',
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        customerId: req.body.customerId,
        workers: req.body.workers || []
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating schedule event:', error);
    res.status(500).json({ error: 'Failed to create schedule event' });
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