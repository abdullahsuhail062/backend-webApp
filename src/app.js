import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// ─── Security Middleware ───────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('/{*path}', cors());

// ─── Rate Limiting ────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── Body Parsing ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payment', paymentRoutes);

// ─── Health Check ─────────────────────────────────────
// src/app.js
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API is running',
    version: '1.0.0'
  });
});

// ─── Error Handling ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;