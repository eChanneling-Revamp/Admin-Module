import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    logger.info('👤 Creating admin user...');

    const email = env.ADMIN_EMAIL;
    const password = env.ADMIN_PASSWORD;

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      logger.warn(`⚠️  Admin user with email ${email} already exists`);
      
      // Ask if user wants to update password
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('Do you want to update the admin password? (y/N): ', resolve);
      });

      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            isActive: true,
            role: UserRole.ADMIN,
          },
        });
        logger.info('✅ Admin password updated successfully');
      } else {
        logger.info('ℹ️  Admin user creation cancelled');
        return;
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      logger.info('✅ Admin user created successfully');
      logger.info(`   Email: ${admin.email}`);
      logger.info(`   Role: ${admin.role}`);
      logger.info(`   Active: ${admin.isActive}`);
    }

    logger.info('🎉 Admin user setup completed!');

  } catch (error) {
    logger.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      logger.info('✅ Admin creation completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Admin creation failed:', error);
      process.exit(1);
    });
}

export default createAdmin;
