import express from 'express';
import {
  getCoupons,
  validateCoupon,
  createCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/validate', validateCoupon);
router.get('/', authenticate, requireAdmin, getCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.delete('/:id', authenticate, requireAdmin, deleteCoupon);

export default router;
