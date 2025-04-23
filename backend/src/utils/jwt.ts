import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Request } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define JwtPayload interface that was previously imported
export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret_key_for_forumx';

console.log("JWT Secret available:", !!process.env.JWT_SECRET);

// Sign JWT token with user information
export const signToken = (user: IUser): string => {
  const payload = { 
    id: user._id,
    email: user.email,
    username: user.username
  };
  
  // Use a hardcoded value for now to avoid type issues
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

// Extract JWT token from request
export const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
}; 