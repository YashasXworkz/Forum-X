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
      console.log('Auth middleware using token from Authorization header');
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Auth middleware using token from cookies');
    }

    // Check if token exists
    if (!token) {
      console.log('Auth middleware: No token provided', {
        hasAuthHeader: !!req.headers.authorization,
        hasCookie: !!(req.cookies && req.cookies.token),
        path: req.path
      });
      return next(createError('Not authorized to access this route', 401));
    }

    // Verify token
    console.log('Auth middleware: Verifying token');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('Auth middleware: Invalid or expired token');
      return next(createError('Invalid or expired token', 401));
    }

    console.log('Auth middleware: Token verified, looking up user:', decoded.id);
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Auth middleware: User not found for ID:', decoded.id);
      return next(createError('User not found', 404));
    }
    
    console.log('Auth middleware: User authenticated:', user.username);
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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