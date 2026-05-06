import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authenticateUser = asyncHandler(async (req, res, next) => {
  // 1. Extract the token
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  try {
    // 2. Verify the token (Use VERIFY, not SIGN)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the latest user data from DB to ensure account still exists/is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isAdmin: true 
      }
    });

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    // 4. Attach user to the request object
    req.user = user;
    
    // 5. Move to the next middleware or controller
    next();
  } catch (error) {
    // Handle expired or tampered tokens specifically
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    throw new ApiError(401, message);
  }
});

/**
 * Guard for Admin-only routes
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
  next();
};

/**
 * Flexible Guard for Role-based access
 * Usage: router.get('/path', authenticateUser, verifyRole('EDITOR', 'MODERATOR'), controller)
 */
export const verifyRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied. Authorized roles: ${roles.join(', ')}`));
  }
  next();
};