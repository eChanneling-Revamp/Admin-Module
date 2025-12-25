import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

// Log database queries in development
if (env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

(prisma as any).$on('error', (e: any) => {
  logger.error('Database error:', e);
  
  // Handle connection closed errors specifically
  if (e.message && e.message.includes('Closed')) {
    logger.warn('Database connection closed, attempting to reconnect...');
    // The next query will automatically trigger a reconnection
  }
});

(prisma as any).$on('info', (e: any) => {
  logger.info('Database info:', e);
});

(prisma as any).$on('warn', (e: any) => {
  logger.warn('Database warning:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;
