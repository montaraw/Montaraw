import express from 'express';
import { getHomepageData } from '../controllers/homepage.controller.js';

const router = express.Router();

router.get('/', getHomepageData);

export default router;
