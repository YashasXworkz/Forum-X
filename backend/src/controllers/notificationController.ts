import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import Notification from '../models/Notification';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Get user notifications
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username avatarUrl')
    .populate('relatedItem', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Notification.countDocuments({ recipient: req.user._id });
  
  // Get unread count
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id,
    isRead: false
  });
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: notifications
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(createError('Notification not found', 404));
  }
  
  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to update this notification', 403));
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (recipient only)
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(createError('Notification not found', 404));
  }
  
  // Check if user is the recipient
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to delete this notification', 403));
  }
  
  await notification.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/read
 * @access  Private
 */
export const deleteReadNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await Notification.deleteMany({
    recipient: req.user._id,
    isRead: true
  });
  
  res.status(200).json({
    success: true,
    message: 'All read notifications deleted'
  });
}); 