import express from 'express';
import {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  getUserDiscussions,
  joinDiscussion,
  leaveDiscussion,
  updateDiscussionStatus,
  getDiscussionMessages
} from '../controllers/discussionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, createDiscussion)
  .get(getDiscussions);

// User discussions route
router.get('/user', protect, getUserDiscussions);

router.route('/:id')
  .get(getDiscussion);

router.post('/:id/join', protect, joinDiscussion);
router.post('/:id/leave', protect, leaveDiscussion);
router.put('/:id/status', protect, updateDiscussionStatus);

// Get messages for a discussion
router.get('/:discussionId/messages', protect, getDiscussionMessages);

export default router; 