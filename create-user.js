import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
  try {
    console.log('\n=== KHS CRM User Creation ===\n');

    // Get user details
    const email = await question('Email: ');
    const name = await question('Name: ');
    const password = await question('Password: ');
    const roleInput = await question('Role (OWNER/WORKER): ');
    const role = roleInput.toUpperCase();

    // Validate role
    if (role !== 'OWNER' && role !== 'WORKER') {
      console.error('Invalid role. Must be OWNER or WORKER');
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true,
      },
    });

    console.log('\n✅ User created successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`ID: ${user.id}`);

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    if (error.code === 'P2002') {
      console.error('A user with this email already exists');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createUser();