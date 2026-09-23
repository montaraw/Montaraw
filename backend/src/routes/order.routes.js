import express from 'express';
import {
  createOrder,
  trackOrder,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
  refundOrder,
  customerCancelOrder,
  customerReturnOrExchangeOrder,
} from '../controllers/order.controller.js';
import { authenticate, requireAdmin, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public / Customer: Place Order, Track, Cancel & Return/Exchange
router.post('/', createOrder);
router.get('/track/:query', trackOrder);
router.post('/:id/cancel', optionalAuthenticate, customerCancelOrder);
router.post('/:id/return-exchange', optionalAuthenticate, customerReturnOrExchangeOrder);

// Customer Authenticated: My Orders
router.get('/my-orders', authenticate, getMyOrders);

// Admin: Order Management & Refunds
router.get('/admin', authenticate, requireAdmin, getAdminOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.post('/admin/:id/refund', authenticate, requireAdmin, refundOrder);

export default router;

