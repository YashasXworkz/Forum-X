import jwt, { Secret } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Request } from 'express';

// Define JwtPayload interface that was previously imported
export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret_key_for_forumx';

// Sign JWT token with user information
export const signToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
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