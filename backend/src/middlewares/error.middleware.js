import securityLog from '../utils/securityLogger.js';

export const errorHandler = (err, req, res, next) => {
  securityLog.alert('SERVER_ERROR_HANDLED', err.message, { req });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Sanitize internal database / driver error details in production
  let clientMessage = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    if (clientMessage.includes('prisma') || clientMessage.includes('database') || clientMessage.includes('PostgreSQL')) {
      clientMessage = 'A database service error occurred. Please try again shortly.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource Not Found - ${req.originalUrl}`,
  });
};
