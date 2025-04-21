import { Request, Response, NextFunction } from 'express';
import { createError } from '../utils';

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate registration data
export const validateRegisterInput = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  // Validate username
  if (username && (username.length < 3 || username.length > 30)) {
    errors.push('Username must be between 3 and 30 characters');
  }

  // Validate email format
  if (email && !isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password strength
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Validate login data
export const validateLoginInput = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Validate item creation data
export const validateItemInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description, category, condition, location } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!name) errors.push('Item name is required');
  if (!description) errors.push('Description is required');
  if (!category) errors.push('Category is required');
  if (!condition) errors.push('Condition is required');
  if (!location) errors.push('Location is required');

  // Validate name length
  if (name && (name.length < 3 || name.length > 100)) {
    errors.push('Name must be between 3 and 100 characters');
  }

  // Validate description length
  if (description && (description.length < 10 || description.length > 1000)) {
    errors.push('Description must be between 10 and 1000 characters');
  }

  // Validate category
  const validCategories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Tools', 'Kitchen', 'Sports', 'Games', 'Other'];
  if (category && !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  // Validate condition
  const validConditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  if (condition && !validConditions.includes(condition)) {
    errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Validate request creation data
export const validateRequestInput = (req: Request, res: Response, next: NextFunction): void => {
  const { itemId, message, pickupDate, returnDate } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!itemId) errors.push('Item ID is required');
  if (!message) errors.push('Message is required');

  // Validate message length
  if (message && (message.length < 5 || message.length > 500)) {
    errors.push('Message must be between 5 and 500 characters');
  }

  // Validate dates if provided
  if (pickupDate && returnDate) {
    const pickupDateTime = new Date(pickupDate).getTime();
    const returnDateTime = new Date(returnDate).getTime();

    if (isNaN(pickupDateTime)) {
      errors.push('Invalid pickup date format');
    }

    if (isNaN(returnDateTime)) {
      errors.push('Invalid return date format');
    }

    if (!isNaN(pickupDateTime) && !isNaN(returnDateTime) && returnDateTime <= pickupDateTime) {
      errors.push('Return date must be after pickup date');
    }
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Validate review creation data
export const validateReviewInput = (req: Request, res: Response, next: NextFunction): void => {
  const { itemId, revieweeId, rating, comment } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!itemId) errors.push('Item ID is required');
  if (!revieweeId) errors.push('Reviewee ID is required');
  if (rating === undefined) errors.push('Rating is required');
  if (!comment) errors.push('Comment is required');

  // Validate rating
  if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    errors.push('Rating must be an integer between 1 and 5');
  }

  // Validate comment length
  if (comment && (comment.length < 5 || comment.length > 500)) {
    errors.push('Comment must be between 5 and 500 characters');
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Validate message creation data
export const validateMessageInput = (req: Request, res: Response, next: NextFunction): void => {
  const { recipientId, content } = req.body;

  const errors: string[] = [];

  // Check if all required fields are provided
  if (!recipientId) errors.push('Recipient ID is required');
  if (!content) errors.push('Message content is required');

  // Validate content length
  if (content && (content.length < 1 || content.length > 1000)) {
    errors.push('Message content must be between 1 and 1000 characters');
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
}; 