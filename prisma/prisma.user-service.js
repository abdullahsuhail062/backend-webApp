import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const userService = {
    getAuthUser: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isAdmin: true,
        // Add any other fields needed for initial UI state
      },
    });
  },
  // Find user by email
  findUserByEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  // Find user by ID with specific selection
  findUserById: async (id, selectFields = { id: true, name: true, email: true, role: true }) => {
    return await prisma.user.findUnique({
      where: { id },
      select: selectFields,
    });
  },

  // Create new user
  createUser: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  // Refresh Token specific logic
  findRefreshToken: async (token) => {
    return await prisma.refreshToken.findUnique({ where: { token } });
  },

  deleteRefreshToken: async (token) => {
    return await prisma.refreshToken.delete({ where: { token } });
  },
  
  // Note: Add saveRefreshToken if your generateTokens doesn't handle DB insertion
};