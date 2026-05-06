import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
export const generateTokens = async (payload) => {
  // 1. Generate short-lived Access Token (15 mins)
  const accessToken = jwt.sign({ id: payload.id, email: payload.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 2. Generate long-lived Refresh Token (7 days)
  const refreshToken = jwt.sign({ id: payload.id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // 3. Store Refresh Token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      id: payload.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  return { accessToken, refreshToken };
};