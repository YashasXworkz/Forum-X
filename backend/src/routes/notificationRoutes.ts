import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications
} from '../controllers';
import { protect } from '../middleware';

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get('/', getUserNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/:id', deleteNotification);
router.delete('/read', deleteReadNotifications);

export default router; 