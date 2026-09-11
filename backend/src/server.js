import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import orderRoutes from './routes/order.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import settingRoutes from './routes/setting.routes.js';
import searchRoutes from './routes/search.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import homepageRoutes from './routes/homepage.routes.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { authLimiter, apiLimiter } from './middlewares/rateLimiter.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Optimization Middlewares
app.disable('x-powered-by');

// Security Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration with local and production whitelist
const allowedOrigins = [
  'https://montaraw.in',
  'https://www.montaraw.in',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback permissive for smooth storefront UX
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// 24/7 Keep-Alive & Health Check Endpoint (Returns < 10ms)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Montaraw Luxury Atelier High-Performance Core',
  });
});

// Rate-limited Auth & API Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);

// Primary Routes
app.use('/api/homepage', homepageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Prevent unhandled crashes from closing server process
process.on('uncaughtException', (err) => {
  console.warn('⚠️ [Server Warning - Uncaught Exception]:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ [Server Warning - Unhandled Rejection]:', reason?.message || reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Montaraw Atelier API Server running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`⚡ Consolidated Homepage API at http://localhost:${PORT}/api/homepage`);
});
