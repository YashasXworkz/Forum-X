import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost
} from '../controllers/postController';
import { createComment, getComments } from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Comment routes
router.route('/:postId/comments')
  .get(getComments)
  .post(protect, createComment);

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/upvote', protect, upvotePost);
router.post('/:id/downvote', protect, downvotePost);

export default router; 