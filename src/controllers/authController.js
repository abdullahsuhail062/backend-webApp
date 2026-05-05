import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateTokens } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { error } from 'node:console';
import { authenticateUser } from '../middleware/authMiddleware.js';

export const refreshToken = asyncHandler(async (req, res)=> {
  const {refreshToken} = req.cookies.refreshToken

  try {
    // Check Prisma for existence
  const dbToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!dbToken) return res.status(403).send();

  // Rotation: Clear old and generate new
  await prisma.refreshToken.delete({ where: { token } });
  const tokens = await generateTokens(payload.userId);

  // Re-issue both cookies
  res.cookie('accessToken', tokens.accessToken, { /* same settings as above */ });
  res.cookie('refreshToken', tokens.refreshToken, { /* same settings as above */ });

  res.json({ status: "Tokens rotated" });

  }catch (error) {
    return res.status(401).json({error: Unauthurized})
  }



})

export const verifyUserToken = asyncHandler(async (req, res) => {
  const {userId} = req.user.id
  try {
    const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true,  isAdmin: true }
  });

  if (!user) throw new ApiError(401, 'User not found');
  


} catch (error) {
    return res.status(401).json({ error: "server error" });
  }
  
})

// ─── Register ─────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
try {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(400, 'Email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true }
  });

  const token = generateTokens({ id: user.id, email: user.email });

  res.status(201).json({ success: true, token, user });
} catch (error) {
return res.status(401).json({ error: "server error" });

}
});

// ─── Login ────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(400, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(400, 'Invalid email or password');

  const {refreshToken, accessToken} = generateTokens({ id: user.id });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,      // Set to false for localhost/HTTP
    sameSite: 'none',
    maxAge: 15 * 60 * 1000 // 15 Minutes
  });
  res.cookie('refreshToken', refreshToken, {
      httpOnly: true,    // 🛡️ JavaScript cannot read this (XSS protection)
      secure: true,      // 🔒 Only sent over HTTPS (use false for local development)
      sameSite: 'strict', // 🛑 Prevents CSRF
      path: '/',         // 📂 Available for all routes
      maxAge: 7 * 24 * 60 * 60 * 1000 // ⏳ 7 days (matching your DB/JWT expiry)
    });

  // ✅ never send password back
  const { password: _, ...safeUser } = user;

  res.json({ success: true, message: 'Login successful', token, user: safeUser });
} catch (error) {
return res.status(401).json({ error: "Unauthorized" });
}
});

// ─── Get Profile ──────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, avatar: true, role: true }
  });
  res.json({ success: true, user });
});