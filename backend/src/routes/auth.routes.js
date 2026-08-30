import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/admin-login', loginAdmin);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
