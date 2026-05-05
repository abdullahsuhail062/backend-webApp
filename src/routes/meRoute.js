import {verifyUserToken } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import express from 'express'

const router = express.Router();

router.get('/me',authenticateUser, verifyUserToken)

export default router;