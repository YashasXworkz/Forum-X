import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import Message from '../models/Message';
import User from '../models/User';
import Notification from '../models/Notification';

/**
 * @desc    Send a message to a user
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { recipientId, content, relatedItemId } = req.body;
  
  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(createError('Recipient not found', 404));
  }
  
  // Cannot message yourself
  if (recipientId === req.user._id.toString()) {
    return next(createError('You cannot send a message to yourself', 400));
  }
  
  // Create message
  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    relatedItem: relatedItemId || undefined
  });
  
  // Create notification
  await Notification.create({
    recipient: recipientId,
    sender: req.user._id,
    type: 'message',
    content: `${req.user.username} sent you a message`,
    relatedItem: relatedItemId || undefined
  });
  
  res.status(201).json({
    success: true,
    data: message
  });
});

/**
 * @desc    Get conversation with a user
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
export const getConversationWithUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;
  
  // Check if other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    return next(createError('User not found', 404));
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Get messages between users
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, recipient: otherUserId },
      { sender: otherUserId, recipient: currentUserId }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatarUrl')
    .populate('recipient', 'username avatarUrl')
    .populate('relatedItem', 'name images');
  
  // Get total count for pagination
  const total = await Message.countDocuments({
    $or: [
      { sender: currentUserId, recipient: otherUserId },
      { sender: otherUserId, recipient: currentUserId }
    ]
  });
  
  // Mark unread messages as read
  await Message.updateMany(
    {
      sender: otherUserId,
      recipient: currentUserId,
      isRead: false
    },
    { isRead: true }
  );
  
  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    otherUser: {
      _id: otherUser._id,
      username: otherUser.username,
      avatarUrl: otherUser.avatarUrl
    },
    data: messages
  });
});

/**
 * @desc    Get user conversations
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getUserConversations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  
  // Get list of users the current user has messaged with
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userId] },
            '$recipient',
            '$sender'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$recipient', userId] },
                { $eq: ['$isRead', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: '$_id',
        user: {
          _id: '$user._id',
          username: '$user.username',
          avatarUrl: '$user.avatarUrl'
        },
        lastMessage: {
          _id: '$lastMessage._id',
          content: '$lastMessage.content',
          createdAt: '$lastMessage.createdAt',
          isRead: '$lastMessage.isRead',
          sender: '$lastMessage.sender'
        },
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private (sender only)
 */
export const deleteMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    return next(createError('Message not found', 404));
  }
  
  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to delete this message', 403));
  }
  
  await message.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 