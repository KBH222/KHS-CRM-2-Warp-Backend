import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@khscrm.com" },
    update: {},
    create: {
      email: "admin@khscrm.com",
      password: hashedPassword,
      name: "Admin User",
      role: "OWNER",
      isActive: true
    }
  });

  // Create some sample data
  const customer1 = await prisma.customer.upsert({
    where: { reference: "A1" },
    update: {},
    create: {
      reference: "A1",
      name: "John Smith",
      phone: "(555) 123-4567",
      email: "john.smith@email.com",
      address: "123 Main St, Austin, TX 78701",
      notes: "Prefers morning appointments"
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { reference: "A2" },
    update: {},
    create: {
      reference: "A2",
      name: "Jane Doe",
      phone: "(555) 987-6543",
      email: "jane.doe@email.com",
      address: "456 Oak Ave, Austin, TX 78702",
      notes: "Has two dogs"
    }
  });

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      title: "Kitchen Remodel",
      description: "Complete kitchen renovation including cabinets and countertops",
      status: "IN_PROGRESS",
      priority: "high",
      totalCost: 25000,
      depositPaid: 5000,
      customerId: customer1.id,
      createdById: adminUser.id,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-02-15")
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Bathroom Renovation",
      description: "Master bathroom remodel",
      status: "QUOTED",
      priority: "medium",
      totalCost: 15000,
      customerId: customer2.id,
      createdById: adminUser.id
    }
  });

  }

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
