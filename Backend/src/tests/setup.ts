import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/echannelling_test_db',
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean up test database
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
});

// Global test teardown
afterAll(async () => {
  // Clean up test database
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  
  // Disconnect from database
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
});

export { prisma };
