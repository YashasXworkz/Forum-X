import express from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
  getPopularCommunities,
  getCommunityBySlug
} from '../controllers/communityController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getCommunities);
router.get('/popular', getPopularCommunities);
router.get('/slug/:slug', getCommunityBySlug);
router.get('/:id', getCommunity);

// Protected routes
router.post('/', protect, createCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.put('/:id', protect, updateCommunity);

export default router; 