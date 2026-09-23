/**
 * Montaraw Luxury Atelier Security & Audit Logger
 * Provides structured audit logging for authentication, authorization,
 * payment integrity, and suspicious request detection.
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ALERT: 'ALERT',
  SECURITY: 'SECURITY_ALERT',
};

function formatLog(level, eventType, details, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    eventType,
    details,
    ip: meta.ip || meta.req?.headers?.['x-forwarded-for'] || meta.req?.socket?.remoteAddress || 'unknown',
    userId: meta.userId || meta.req?.user?.id || null,
    userAgent: meta.req?.headers?.['user-agent'] || null,
    path: meta.req?.originalUrl || null,
  };

  const formatted = `[${timestamp}] [${level}] [${eventType}] - ${typeof details === 'string' ? details : JSON.stringify(details)}`;

  if (level === LOG_LEVELS.SECURITY || level === LOG_LEVELS.ALERT) {
    console.error(`🚨 ${formatted}`, logEntry);
  } else if (level === LOG_LEVELS.WARN) {
    console.warn(`⚠️ ${formatted}`);
  } else {
    console.log(`🔒 ${formatted}`);
  }

  return logEntry;
}

export const securityLog = {
  info: (eventType, details, meta) => formatLog(LOG_LEVELS.INFO, eventType, details, meta),
  warn: (eventType, details, meta) => formatLog(LOG_LEVELS.WARN, eventType, details, meta),
  alert: (eventType, details, meta) => formatLog(LOG_LEVELS.ALERT, eventType, details, meta),
  securityAlert: (eventType, details, meta) => formatLog(LOG_LEVELS.SECURITY, eventType, details, meta),
};

export default securityLog;
