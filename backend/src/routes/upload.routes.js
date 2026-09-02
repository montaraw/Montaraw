import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
});

// Single image upload endpoint: POST /api/upload
router.post('/', upload.single('file'), uploadImage);

export default router;
