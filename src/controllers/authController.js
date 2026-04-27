import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─── Register ─────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(400, 'Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true }
  });

  const token = generateToken({ id: user.id, email: user.email });

  res.status(201).json({ success: true, token, user });
});

// ─── Login ────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(400, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(400, 'Invalid email or password');

  const token = generateToken({ id: user.id, email: user.email });

  // ✅ never send password back
  const { password: _, ...safeUser } = user;

  res.json({ success: true, message: 'Login successful', token, user: safeUser });
});

// ─── Get Profile ──────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, avatar: true, role: true }
  });
  res.json({ success: true, user });
});