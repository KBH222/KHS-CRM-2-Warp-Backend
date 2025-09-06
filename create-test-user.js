import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    // Create or update owner user
    const owner = await prisma.user.upsert({
      where: { email: 'owner@khs.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'owner@khs.com',
        password: hashedPassword,
        name: 'John Owner',
        role: 'OWNER',
        isActive: true,
      },
    });
    // Create or update worker user
    const worker = await prisma.user.upsert({
      where: { email: 'worker@khs.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'worker@khs.com',
        password: hashedPassword,
        name: 'Jane Worker',
        role: 'WORKER',
        isActive: true,
      },
    });
    } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();