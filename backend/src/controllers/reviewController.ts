import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import Review from '../models/Review';
import RequestModel from '../models/Request';
import Item from '../models/Item';
import Notification from '../models/Notification';

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId, revieweeId, rating, comment } = req.body;

  // Validate rating
  if (rating < 1 || rating > 5) {
    return next(createError('Rating must be between 1 and 5', 400));
  }

  // Check if item exists
  const item = await Item.findById(itemId);
  if (!item) {
    return next(createError('Item not found', 404));
  }

  // Check if there was a completed request for this item
  const completedRequest = await RequestModel.findOne({
    item: itemId,
    status: 'completed',
    $or: [
      // Either user was borrower or lender
      { requester: req.user._id, item: { owner: revieweeId } },
      { requester: revieweeId, item: { owner: req.user._id } }
    ]
  });

  if (!completedRequest) {
    return next(createError('You can only review after completing a borrowing transaction', 400));
  }

  // Check if user has already reviewed this item
  const existingReview = await Review.findOne({
    reviewer: req.user._id,
    item: itemId
  });

  if (existingReview) {
    return next(createError('You have already reviewed this transaction', 400));
  }

  // Create review
  const review = await Review.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    item: itemId,
    rating,
    comment
  });

  // Create notification
  await Notification.create({
    recipient: revieweeId,
    sender: req.user._id,
    type: 'review',
    content: `${req.user.username} has left you a review`,
    relatedItem: itemId
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ reviewee: userId })
    .populate('reviewer', 'username avatarUrl')
    .populate('item', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Review.countDocuments({ reviewee: userId });
  
  // Calculate average rating
  const ratingStats = await Review.aggregate([
    { $match: { reviewee: userId } },
    { 
      $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 } 
      } 
    }
  ]);
  
  const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;
  
  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    averageRating,
    data: reviews
  });
});

/**
 * @desc    Get review by ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)
    .populate('reviewer', 'username avatarUrl')
    .populate('reviewee', 'username avatarUrl')
    .populate('item', 'name images description');
  
  if (!review) {
    return next(createError('Review not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private (reviewer only)
 */
export const updateReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { rating, comment } = req.body;
  
  let review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(createError('Review not found', 404));
  }
  
  // Check if user is the reviewer
  if (review.reviewer.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to update this review', 403));
  }
  
  // Validate rating
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return next(createError('Rating must be between 1 and 5', 400));
  }
  
  // Update review
  review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment })
    },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private (reviewer only)
 */
export const deleteReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(createError('Review not found', 404));
  }
  
  // Check if user is the reviewer
  if (review.reviewer.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to delete this review', 403));
  }
  
  await review.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 