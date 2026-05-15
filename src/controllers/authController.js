import { userService } from '../../prisma/prisma.user-service.js' 
import jwt from 'jsonwebtoken';
import { generateTokens } from '../utils/generateToken.js';
import { setAuthCookies } from '../utils/auth.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';

export const getMe = asyncHandler(async (req, res) => {
  // 1. The middleware already verified the token and fetched the ID
  // 2. We fetch a fresh copy of the user to ensure data is current
  const user = await userService.getAuthUser(req.user.id);

  if (!user) {
    throw new ApiError(404, "User session not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// ─── Register ─────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) throw new ApiError(400, 'Email already exists');

  const user = await userService.createUser({ name, email, password });

  const tokens = await generateTokens({ id: user.id, email: user.email });
  setAuthCookies(res, tokens);

  res.status(201).json({ success: true, user });
});

// ─── Login ────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findUserByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const tokens = await generateTokens({ id: user.id, email: user.email });
  setAuthCookies(res, tokens);

  const { password: _, ...safeUser } = user;
  res.json({ success: true, message: 'Login successful', user: safeUser });
});

// ─── Get Profile ──────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  // req.user.id comes from the authenticateUser middleware
  const user = await userService.findUserById(req.user.id, {
    id: true, name: true, email: true, avatar: true, role: true 
  });
  
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user });
});



export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  
  // DEBUG LOGS (Temporary)
  console.log("Token received:", !!token);
  console.log("Secret exists:", !!process.env.REFRESH_TOKEN_SECRET);

  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    // Log the specific JWT error (e.g., 'invalid signature', 'jwt malformed')
    console.error("JWT Verify Error:", err.message);
    throw new ApiError(403, "Refresh token expired or invalid");
  }
});