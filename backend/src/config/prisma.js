import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.DEBUG_PRISMA === 'true' ? ['error', 'warn'] : [],
});

export default prisma;
