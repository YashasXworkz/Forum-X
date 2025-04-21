import { Request, Response } from 'express';
import Discussion from '../models/Discussion';
import Community from '../models/Community';
import { errorHandler } from '../utils/errorHandler';
import DiscussionMessage from '../models/DiscussionMessage';
import mongoose from 'mongoose';

// @desc    Create a new discussion
// @route   POST /api/discussions
// @access  Private
export const createDiscussion = async (req: Request, res: Response) => {
  try {
    const { title, description, communityId, isPrivate, startTime, status } = req.body;
    const userId = req.user?._id;

    if (!title || !communityId) {
      return res.status(400).json({
        success: false,
        error: 'Title and community are required'
      });
    }

    // Find community to get its name
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Create discussion
    const discussion = await Discussion.create({
      title,
      description,
      host: userId,
      communityId,
      communityName: community.name,
      isPrivate: isPrivate || false,
      startTime: startTime || new Date(),
      status: status || 'active',
      participants: [userId],
      participantCount: 1
    });

    return res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get all discussions
// @route   GET /api/discussions
// @access  Public
export const getDiscussions = async (req: Request, res: Response) => {
  try {
    console.log('GET /api/discussions - Query:', req.query);
    
    // Implement filtering options here if needed
    const discussions = await Discussion.find()
      .populate('host', 'username avatarUrl')
      .sort({ createdAt: -1 });
    
    console.log(`GET /api/discussions - Found ${discussions.length} discussions`);
    
    // Check if discussions array is valid
    if (!Array.isArray(discussions)) {
      console.error('GET /api/discussions - discussions is not an array:', discussions);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from database'
      });
    }
    
    return res.status(200).json({
      success: true,
      count: discussions.length,
      data: discussions
    });
  } catch (error) {
    console.error('GET /api/discussions - Error:', error);
    return errorHandler(error, req, res);
  }
};

// @desc    Get user's discussions (hosted or participating)
// @route   GET /api/discussions/user
// @access  Private
export const getUserDiscussions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const discussions = await Discussion.find({
      $or: [
        { host: userId },
        { participants: userId }
      ]
    })
      .populate('host', 'username avatarUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: discussions.length,
      data: discussions
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get a single discussion
// @route   GET /api/discussions/:id
// @access  Public
export const getDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format to avoid cast errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }
    
    const discussion = await Discussion.findById(id)
      .populate('host', 'username avatarUrl')
      .populate('participants', 'username avatarUrl');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Join a discussion
// @route   POST /api/discussions/:id/join
// @access  Private
export const joinDiscussion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }
    
    // Check if user is already a participant
    if (discussion.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are already a participant in this discussion'
      });
    }
    
    // Add user to participants array
    discussion.participants.push(userId);
    discussion.participantCount = discussion.participants.length;
    
    await discussion.save();
    
    return res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Leave a discussion
// @route   POST /api/discussions/:id/leave
// @access  Private
export const leaveDiscussion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }
    
    // Check if user is the host
    if (discussion.host.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Host cannot leave the discussion'
      });
    }
    
    // Check if user is a participant
    if (!discussion.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a participant in this discussion'
      });
    }
    
    // Remove user from participants array
    discussion.participants = discussion.participants.filter(
      participant => participant.toString() !== userId.toString()
    );
    discussion.participantCount = discussion.participants.length;
    
    await discussion.save();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Update discussion status
// @route   PUT /api/discussions/:id/status
// @access  Private (host only)
export const updateDiscussionStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }
    
    if (!status || !['active', 'scheduled', 'ended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }
    
    // Check if user is the host
    if (discussion.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the host can update the discussion status'
      });
    }
    
    discussion.status = status;
    await discussion.save();
    
    return res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * @desc    Get messages for a discussion
 * @route   GET /api/discussions/:discussionId/messages
 * @access  Private
 */
export const getDiscussionMessages = async (req: Request, res: Response) => {
  try {
    const { discussionId } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    // Get messages
    const messages = await DiscussionMessage.find({ discussionId })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await DiscussionMessage.countDocuments({ discussionId });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: messages
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}; 