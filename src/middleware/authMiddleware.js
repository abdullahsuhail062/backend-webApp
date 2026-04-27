import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authenticateUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true, isAdmin: true }
  });

  if (!user) throw new ApiError(401, 'User not found');

  req.user = user;
  next();
});

export const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};

export const verifyRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    throw new ApiError(403, `Role ${req.user?.role} is not authorized`);
  }
  next();
};