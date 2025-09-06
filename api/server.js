const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://khs-crm-frontend.vercel.app',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Backend is running',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Backend is running but database connection failed',
      error: error.message
    });
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a customer
app.post('/api/customers', async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connected successfully',
    database: 'Connected to Neon PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// For Vercel
module.exports = app;