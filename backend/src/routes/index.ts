import express from 'express';
import userRoutes from './userRoutes';
import itemRoutes from './itemRoutes';
import requestRoutes from './requestRoutes';
import reviewRoutes from './reviewRoutes';
import notificationRoutes from './notificationRoutes';
import messageRoutes from './messageRoutes';
import discussionRoutes from './discussionRoutes';
import communityRoutes from './communityRoutes';
import postRoutes from './postRoutes';
import commentRoutes from './commentRoutes';
import uploadRoutes from './uploadRoutes';
import { getCommunityPosts } from '../controllers/postController';
import { protect } from '../middleware/auth';

const router = express.Router();

// API routes
router.use('/api/users', userRoutes);
router.use('/api/items', itemRoutes);
router.use('/api/requests', requestRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/discussions', discussionRoutes);
router.use('/api/communities', communityRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/upload', uploadRoutes);

// Additional routes
router.get('/api/communities/:communityId/posts', getCommunityPosts);

export default router; 