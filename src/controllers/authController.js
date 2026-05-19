import { userService } from '../../prisma/prisma.user-service.js' 
import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { setAuthCookies, setAuthCookiesForAccessToken, setAuthCookiesForRefreshToken } from '../utils/auth.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';

export const getMe = asyncHandler(async (req, res) => {
  // 🚀 NO database queries! Just read the data your middleware already prepared.
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
// ─── Register ─────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) throw new ApiError(400, 'Email already exists');

  const user = await userService.createUser({ name, email, password });

  const refreshToken = await generateRefreshToken({ id: user.id});
  const accessToken = generateAccessToken({id: user.id})
  setAuthCookiesForRefreshToken(res, refreshToken);
  setAuthCookiesForAccessToken(res, accessToken);

  res.status(201).json({ success: true, user });
});

// ─── Login ────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  

  const user = await userService.findUserByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');
const refreshToken = await generateRefreshToken({ id: user.id });
const accessToken = generateAccessToken({ id: user.id });

// ✅ FIXED: Wrapping them in objects creates { refreshToken: '...' } and { accessToken: '...' }
setAuthCookiesForRefreshToken(res, { refreshToken });
setAuthCookiesForAccessToken(res, { accessToken });


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
  let token = req.cookies.refreshToken;
  
  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  // Ensure any URL-encoded cookie characters are cleanly decoded
  token = decodeURIComponent(token);

  // 1. Fetch the token from the database first
  const storedTokenRecord = await userService.findRefreshToken(token);

  // 2. ✅ FIXED COMPARISON: Compare the string token against the object property
  if (!storedTokenRecord || storedTokenRecord.token !== token) {
    throw new ApiError(403, "Refresh token is invalid or has been revoked");
  }

  // 3. Check expiration date from database state
  if (new Date() > storedTokenRecord.expiresAt) {
    throw new ApiError(403, "Refresh token expired. Please login again.");
  }

  try {
    // 4. Verify cryptographic signature 
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    // 5. ✅ FIXED USER ID: Extract from the nested Prisma user model relation
    const targetUserId = storedTokenRecord.user.id;

    // Generate and set the fresh short-lived access token
    const accessToken = generateAccessToken({ id: targetUserId });
    
    // Wrap it in an object format matching your function's signature
    setAuthCookiesForAccessToken(res, { accessToken });

    // 6. Respond successfully
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });

  } catch (error) {
    throw new ApiError(403, "Refresh token signature verification failed");
  }
});