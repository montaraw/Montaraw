import express from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBanners);
router.post('/', authenticate, requireAdmin, createBanner);
router.put('/:id', authenticate, requireAdmin, updateBanner);
router.delete('/:id', authenticate, requireAdmin, deleteBanner);

export default router;
