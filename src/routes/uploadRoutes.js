// src/routes/uploadRoutes.js
import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, upload.single('file'), uploadFile);

export default router;