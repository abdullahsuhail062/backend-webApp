// src/routes/emailRoutes.js
import express from 'express';
import { sendContactEmail } from '../controllers/emailController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', authenticateUser, sendContactEmail);

export default router;