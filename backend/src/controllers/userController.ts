import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import { signToken } from '../utils/jwt';
import User from '../models/User';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  try {
    // Check if all required fields are provided
    if (!username || !email || !password) {
      return next(createError('Please provide all required fields: username, email, and password', 400));
    }

    // Check if user already exists with that email or username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      if (userExists.email === email) {
        return next(createError('User with that email already exists', 400));
      }
      if (userExists.username === username) {
        return next(createError('Username is already taken', 400));
      }
      return next(createError('User with that email or username already exists', 400));
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate JWT token
    const token = signToken(user);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    // Handle duplicate key errors from MongoDB
    if (error.code === 11000) {
      const fieldName = Object.keys(error.keyPattern)[0];
      return next(createError(`${fieldName === 'email' ? 'Email' : 'Username'} is already in use`, 400));
    }
    next(error);
  }
});

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(createError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(createError('Invalid credentials', 401));
  }

  // Generate JWT token
  const token = signToken(user);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt
    },
    token
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, bio, avatarUrl } = req.body;
  const userId = req.user._id;

  // Check if username or email already exists
  if (username || email) {
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]}
      ]
    });

    if (existingUser) {
      return next(createError('Username or email already in use', 400));
    }
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(username && { username }),
      ...(email && { email }),
      ...(bio && { bio }),
      ...(avatarUrl && { avatarUrl })
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(createError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(createError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Deactivate user account
 * @route   PUT /api/users/deactivate
 * @access  Private
 */
export const deactivateAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  // In a real application, we might want to change a status field rather than actually deleting
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(createError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * @desc    Delete user account permanently
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  // Delete user account
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(createError('User not found', 404));
  }

  // In a real application, you would also need to:
  // 1. Delete all user-related data (items, requests, reviews, messages, etc.)
  // 2. Handle any pending transactions or commitments

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
}); 