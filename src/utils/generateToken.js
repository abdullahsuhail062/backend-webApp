import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
export const generateTokens = async (payload) => {
  // 1. Generate short-lived Access Token (15 mins)
  const accessToken = jwt.sign({ id: payload.id, email: payload.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 2. Generate long-lived Refresh Token (7 days)
  const refreshToken = jwt.sign({ id: payload.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // 3. Store Refresh Token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: payload.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  return { accessToken, refreshToken };
};




export const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is missing from environment variables");
  }
  
  // Fix: Map the string variable to the 'expiresIn' key inside a plain object
  return jwt.sign(
    { id: payload.id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN } 
  );
};


export const generateRefreshToken = async (payload) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is missing from environment variables");
  }

  // 1. Sign the token string
  const tokenString = jwt.sign(
    { id: payload.id }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  // 2. Await the database insert (Safe inside the async block)
  await prisma.refreshToken.create({
    data: {
      token: tokenString,
      userId: payload.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. The return statement is legal because it is inside the function
  return tokenString; 
}; // <──  THE CORRECT PLACEMENT FOR THE CLOSING BRACE