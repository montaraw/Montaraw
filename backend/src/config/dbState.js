import prisma from './prisma.js';

let dbHealthy = true;
let lastCheckTime = 0;
const CHECK_COOLDOWN_MS = 30000; // 30 seconds check interval when offline

/**
 * Check if the database connection is responsive without blocking request pipelines
 */
export async function isDatabaseAlive() {
  const now = Date.now();

  // If marked unhealthy recently, avoid waiting on Prisma timeout
  if (!dbHealthy && now - lastCheckTime < CHECK_COOLDOWN_MS) {
    return false;
  }

  try {
    // Quick probe with timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Probe timeout')), 2500)),
    ]);
    dbHealthy = true;
    return true;
  } catch (err) {
    dbHealthy = false;
    lastCheckTime = now;
    return false;
  }
}

export function setDatabaseOffline() {
  dbHealthy = false;
  lastCheckTime = Date.now();
}

export function setDatabaseOnline() {
  dbHealthy = true;
}

export function getDatabaseStatus() {
  return dbHealthy;
}
