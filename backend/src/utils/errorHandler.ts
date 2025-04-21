import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a custom API error
 * @param message Error message
 * @param statusCode HTTP status code
 * @returns ApiError instance
 */
export const createError = (message: string, statusCode: number): ApiError => {
  return new ApiError(message, statusCode);
};

/**
 * Catch async errors in controller functions
 * @param fn Controller function
 * @returns Express middleware function that catches errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

interface MongooseError extends Error {
  code?: number;
  keyValue?: any;
  name: string;
  errors?: any;
}

export const errorHandler = (err: any, req: Request, res: Response) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    // Special case for 'popular' route which is not a valid ObjectId
    if (err.value === 'popular' && req.originalUrl.includes('/communities/popular')) {
      return res.status(404).json({
        success: false,
        error: 'Popular communities route should be accessed at /api/communities/popular'
      });
    }
    
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      error: message
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      error: message,
      field
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message);
    return res.status(400).json({
      success: false,
      error: message
    });
  }

  // Return generic server error for unhandled errors
  return res.status(500).json({
    success: false,
    error: 'Server Error'
  });
}; 