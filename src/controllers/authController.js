import { userService } from '../../prisma/prisma.user-service.js' 
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

// ─── Refresh Token ────────────────────────────────────
// export const refreshToken = asyncHandler(async (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (!token) throw new ApiError(401, "No refresh token provided");

//   // 1. Verify JWT signature/expiration first
//   let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//   } catch (err) {
//     throw new ApiError(403, "Refresh token expired or invalid");
//   }

//   // 2. Check DB
//   const dbToken = await prisma.refreshToken.findUnique({ where: { token } });
//   if (!dbToken) {
//     // Optional: If token not in DB but JWT was valid, someone might be reusing an old token!
//     throw new ApiError(403, "Token revoked");
//   }

//   // 3. Get User for full payload (to get the email!)
//   const user = await prisma.user.findUnique({ where: { id: dbToken.userId } });

//   // 4. Rotation: Delete OLD, Create NEW
//   await prisma.refreshToken.delete({ where: { token } });
//   const tokens = await generateTokens(user); // Now has id and email
  
//   setAuthCookies(res, tokens);
//   res.json({ success: true });
// });

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