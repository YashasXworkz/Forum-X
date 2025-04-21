import express from 'express';
import {
  createReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers';
import { protect, validateReviewInput } from '../middleware';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, validateReviewInput, createReview);
router.put('/:id', protect, validateReviewInput, updateReview);
router.delete('/:id', protect, deleteReview);

export default router; 