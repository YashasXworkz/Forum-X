import express from 'express';
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  voteComment,
  deleteComment
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

// Routes for /api/comments
router.route('/:id')
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);
  
router.route('/:id/vote').post(protect, voteComment);

export default router; 