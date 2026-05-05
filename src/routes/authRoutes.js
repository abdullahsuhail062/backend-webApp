// src/routes/authRoutes.js
import express from 'express';
import { register, login, getProfile, verifyUserToken } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/refresh', refreshToken);
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);
router.get('/me',authenticateUser, verifyUserToken)

export default router;