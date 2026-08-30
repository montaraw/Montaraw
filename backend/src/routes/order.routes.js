import express from 'express';
import {
  createOrder,
  trackOrder,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public: Place Order & Track
router.post('/', createOrder);
router.get('/track/:query', trackOrder);

// Customer Authenticated: My Orders
router.get('/my-orders', authenticate, getMyOrders);

// Admin: Order Management
router.get('/admin', authenticate, requireAdmin, getAdminOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
