/**
 * Zero-dependency Sliding-Window Rate Limiter Middleware
 */
const requestBuckets = new Map();

function createLimiter({ windowMs = 60000, max = 100, message = 'Too many requests, please slow down.' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestBuckets.has(ip)) {
      requestBuckets.set(ip, []);
    }

    const timestamps = requestBuckets.get(ip).filter((time) => time > windowStart);
    timestamps.push(now);
    requestBuckets.set(ip, timestamps);

    // Clean up memory periodically
    if (requestBuckets.size > 5000) {
      for (const [key, times] of requestBuckets.entries()) {
        if (times.length === 0 || times[times.length - 1] < windowStart) {
          requestBuckets.delete(key);
        }
      }
    }

    if (timestamps.length > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
}

// 5 login attempts per minute
export const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.',
});

// 3 registration attempts per minute
export const registerLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many registration requests. Please wait 1 minute.',
});

// 12 payment order creations per minute per IP
export const paymentOrderLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 12,
  message: 'Too many payment order requests. Please wait a moment before retrying.',
});

// 20 payment signature verification attempts per minute per IP
export const paymentVerifyLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many payment verification requests. Please wait.',
});

// 15 uploads per minute per IP
export const uploadLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Upload rate limit exceeded. Please wait 1 minute before uploading again.',
});

// 120 general API calls per minute
export const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'API rate limit exceeded. Please slow down.',
});
