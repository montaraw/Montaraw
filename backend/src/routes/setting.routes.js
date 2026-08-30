import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
