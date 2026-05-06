import {verifyUser } from '../controllers/authController.js';
import express from 'express'

const router = express.Router();

router.get('/me', verifyUser)

export default router;