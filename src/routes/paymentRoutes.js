// src/routes/paymentRoutes.js
import express from 'express';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-intent', authenticateUser, createPaymentIntent);
router.post('/confirm', authenticateUser, confirmPayment);

export default router;