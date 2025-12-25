import { PrismaClient, UserRole, BranchType, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger';

const prisma = new PrismaClient();

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@echannelling.com' },
      update: {},
      create: {
        email: 'admin@echannelling.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    logger.info('✅ Admin user created:', adminUser.email);

    // Create sample users
    const users = [
      {
        email: 'doctor1@echannelling.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Dr. John',
        lastName: 'Smith',
        role: UserRole.DOCTOR,
      },
      {
        email: 'hospital1@echannelling.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Hospital',
        lastName: 'Manager',
        role: UserRole.HOSPITAL,
      },
      {
        email: 'patient1@echannelling.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.PATIENT,
      },
    ];

    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
      logger.info('✅ User created:', user.email);
    }

    // Create sample branches
    const branches = [
      {
        name: 'Colombo General Hospital',
        code: 'CGH001',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        type: BranchType.HOSPITAL,
        address: '123 Hospital Road, Colombo 07',
        phone: '+94 11 234 5678',
        email: 'info@cgh.lk',
        description: 'Main general hospital in Colombo',
      },
      {
        name: 'Kandy Medical Center',
        code: 'KMC001',
        city: 'Kandy',
        district: 'Kandy',
        province: 'Central',
        type: BranchType.HOSPITAL,
        address: '456 Medical Street, Kandy',
        phone: '+94 81 234 5678',
        email: 'info@kmc.lk',
        description: 'Modern medical center in Kandy',
      },
      {
        name: 'Galle Clinic',
        code: 'GAL001',
        city: 'Galle',
        district: 'Galle',
        province: 'Southern',
        type: BranchType.CLINIC,
        address: '789 Clinic Lane, Galle',
        phone: '+94 91 234 5678',
        email: 'info@galleclinic.lk',
        description: 'Family clinic in Galle',
      },
      {
        name: 'Jaffna Laboratory',
        code: 'JAF001',
        city: 'Jaffna',
        district: 'Jaffna',
        province: 'Northern',
        type: BranchType.LABORATORY,
        address: '321 Lab Street, Jaffna',
        phone: '+94 21 234 5678',
        email: 'info@jaffnalab.lk',
        description: 'Diagnostic laboratory in Jaffna',
      },
      {
        name: 'Anuradhapura Pharmacy',
        code: 'ANU001',
        city: 'Anuradhapura',
        district: 'Anuradhapura',
        province: 'North Central',
        type: BranchType.PHARMACY,
        address: '654 Pharmacy Road, Anuradhapura',
        phone: '+94 25 234 5678',
        email: 'info@anupharmacy.lk',
        description: '24/7 pharmacy in Anuradhapura',
      },
    ];

    for (const branchData of branches) {
      const branch = await prisma.branch.upsert({
        where: { code: branchData.code },
        update: {},
        create: branchData,
      });
      logger.info('✅ Branch created:', branch.name);
    }

    // Create sample invoices
    const branchIds = await prisma.branch.findMany({
      select: { id: true, code: true },
    });

    if (branchIds.length > 0) {
      const invoices = [
        {
          branchId: branchIds[0].id,
          amount: 50000.00,
          status: InvoiceStatus.PAID,
          dueDate: new Date('2024-01-15'),
          paidAt: new Date('2024-01-10'),
          description: 'Monthly service fee - January 2024',
        },
        {
          branchId: branchIds[0].id,
          amount: 75000.00,
          status: InvoiceStatus.PENDING,
          dueDate: new Date('2024-02-15'),
          description: 'Monthly service fee - February 2024',
        },
        {
          branchId: branchIds[1].id,
          amount: 60000.00,
          status: InvoiceStatus.PAID,
          dueDate: new Date('2024-01-20'),
          paidAt: new Date('2024-01-18'),
          description: 'Equipment maintenance fee',
        },
        {
          branchId: branchIds[2].id,
          amount: 30000.00,
          status: InvoiceStatus.OVERDUE,
          dueDate: new Date('2024-01-10'),
          description: 'Consultation fees - December 2023',
        },
        {
          branchId: branchIds[3].id,
          amount: 45000.00,
          status: InvoiceStatus.PENDING,
          dueDate: new Date('2024-02-28'),
          description: 'Laboratory equipment rental',
        },
      ];

      for (const invoiceData of invoices) {
        const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
        
        const invoice = await prisma.invoice.create({
          data: {
            ...invoiceData,
            invoiceNo,
          },
        });
        logger.info('✅ Invoice created:', invoice.invoiceNo);
      }
    }

    // Create sample audit logs
    const auditLogs = [
      {
        userId: adminUser.id,
        action: 'SYSTEM_INIT',
        resource: 'system',
        description: 'System initialized with seed data',
        metadata: {
          seedVersion: '1.0.0',
          timestamp: new Date(),
        },
      },
      {
        userId: adminUser.id,
        action: 'USER_LOGIN',
        description: 'Admin user logged in',
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script',
      },
    ];

    for (const auditData of auditLogs) {
      await prisma.auditLog.create({
        data: auditData,
      });
    }

    logger.info('✅ Audit logs created');

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('📊 Summary:');
    logger.info(`   - Users: ${await prisma.user.count()}`);
    logger.info(`   - Branches: ${await prisma.branch.count()}`);
    logger.info(`   - Invoices: ${await prisma.invoice.count()}`);
    logger.info(`   - Audit Logs: ${await prisma.auditLog.count()}`);

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      logger.info('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seed;
