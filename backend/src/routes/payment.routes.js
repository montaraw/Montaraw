import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPaymentConfig,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Configuration endpoint
router.get('/config', getPaymentConfig);

// Initiate Razorpay checkout order
router.post('/create-order', createRazorpayOrder);

// Verify payment signature
router.post('/verify', verifyRazorpayPayment);

// Webhook listener
router.post('/webhook', handleRazorpayWebhook);

export default router;
