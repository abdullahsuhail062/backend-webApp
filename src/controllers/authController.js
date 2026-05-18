import { userService } from '../../prisma/prisma.user-service.js' 
import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, generateTokens } from '../utils/generateToken.js';
import { setAuthCookies, setAuthCookiesForAccessToken, setAuthCookiesForRefreshToken } from '../utils/auth.service.js';
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

  const refreshToken = await generateRefreshToken({ id: user.id});
  const accessToken = generateAccessToken({id: user.id})
  setAuthCookiesForRefreshToken(res, refreshToken);
  setAuthCookiesForAccessToken(res, accessToken);

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
  console.log(token, 'cookies extracted token');
  
  
  if (!token) throw new ApiError(401, "No refresh token provided");

  // Fix: Ensure any URL-encoded cookie characters are cleanly decoded
  token = decodeURIComponent(token);

  // DEBUG LOG: Print the literal string characters to your Vercel console
  console.log("Cleaned Token String:", token);

  let decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  // If the user doesn't exist, or the token in the DB doesn't match the cookie token
  if (!user || user.refreshToken !== token) {
    throw new ApiError(403, "Refresh token is invalid or has been revoked");
  }

  // === 1. GENERATE NEW ACCESS TOKEN ===
  // Use decoded.id or whatever property you originally embedded in the payload
  const accessToken = generateAccessToken({id: user.id})
  setAuthCookiesForAccessToken(res, accessToken);
  // === 2. SEND THE RESPONSE (Crucial!) ===
  // This explicitly closes the HTTP request so Vercel and Angular can move on
  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });
});

  