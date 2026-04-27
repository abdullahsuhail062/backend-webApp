// src/routes/authRoutes.js
import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);

export default router;