import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import orderRoutes from './routes/order.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import settingRoutes from './routes/setting.routes.js';
import searchRoutes from './routes/search.routes.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Montaraw Luxury Atelier API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/search', searchRoutes);

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
  console.log(`💡 Note: To connect PostgreSQL, set DATABASE_URL in backend/.env`);
});
