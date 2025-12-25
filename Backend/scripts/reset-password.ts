import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Get user email
    const email = await new Promise<string>((resolve) => {
      rl.question('Enter user email: ', resolve);
    });

    if (!email) {
      logger.error('❌ Email is required');
      rl.close();
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.error(`❌ User with email ${email} not found`);
      rl.close();
      return;
    }

    logger.info(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Get new password
    const password = await new Promise<string>((resolve) => {
      rl.question('Enter new password (min 8 characters): ', resolve);
    });

    if (!password || password.length < 8) {
      logger.error('❌ Password must be at least 8 characters long');
      rl.close();
      return;
    }

    // Confirm password
    const confirmPassword = await new Promise<string>((resolve) => {
      rl.question('Confirm new password: ', resolve);
    });

    if (password !== confirmPassword) {
      logger.error('❌ Passwords do not match');
      rl.close();
      return;
    }

    rl.close();

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Delete all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    logger.info('✅ Password reset successfully');
    logger.info('✅ All user sessions have been invalidated');
    logger.info(`👤 User ${user.email} can now login with the new password`);

  } catch (error) {
    logger.error('❌ Error resetting password:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  resetPassword()
    .then(() => {
      logger.info('✅ Password reset completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Password reset failed:', error);
      process.exit(1);
    });
}

export default resetPassword;
