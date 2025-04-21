import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createError } from '../utils/errorHandler';
import User from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return next(createError('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return next(createError('Invalid or expired token', 401));
    }

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError('User not found', 404));
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(createError('Not authorized to access this route', 401));
  }
};

/**
 * Middleware to restrict routes to specific user roles
 * @param roles Array of roles that have access
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authorized to access this route', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(createError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    
    next();
  };
}; 