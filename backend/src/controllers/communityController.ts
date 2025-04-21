import { Request, Response } from 'express';
import Community from '../models/Community';
import { errorHandler } from '../utils/errorHandler';

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name, description, category, isPrivate, imageUrl, slug } = req.body;
    const userId = req.user?._id;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and category are required'
      });
    }

    // Check if community with the same name already exists
    const existingCommunity = await Community.findOne({ 
      $or: [{ name }, { slug: slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") }] 
    });
    
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        error: existingCommunity.name === name 
          ? 'Community with this name already exists' 
          : 'Community with this slug already exists'
      });
    }

    // Generate slug if not provided
    const communitySlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    // Create community
    const community = await Community.create({
      name,
      slug: communitySlug,
      description,
      creator: userId,
      category,
      isPrivate: isPrivate || false,
      imageUrl: imageUrl || '',
      members: [userId],
      memberCount: 1
    });

    return res.status(201).json({
      success: true,
      data: community
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
export const getCommunities = async (req: Request, res: Response) => {
  try {
    // Implement filtering options here if needed
    const communities = await Community.find()
      .populate('creator', 'username avatarUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get a single community
// @route   GET /api/communities/:id
// @access  Public
export const getCommunity = async (req: Request, res: Response) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'username avatarUrl')
      .populate('members', 'username avatarUrl');

    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Join a community
// @route   POST /api/communities/:id/join
// @access  Private
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this community'
      });
    }
    
    // Add user to members array
    community.members.push(userId);
    community.memberCount = community.members.length;
    
    await community.save();
    
    return res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Leave a community
// @route   POST /api/communities/:id/leave
// @access  Private
export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    // Check if user is the creator
    if (community.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Creator cannot leave the community'
      });
    }
    
    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this community'
      });
    }
    
    // Remove user from members array
    community.members = community.members.filter(
      member => member.toString() !== userId.toString()
    );
    community.memberCount = community.members.length;
    
    await community.save();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Update a community
// @route   PUT /api/communities/:id
// @access  Private (creator only)
export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const { description, category, isPrivate, imageUrl } = req.body;
    const userId = req.user?._id;
    
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    // Check if user is the creator
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the creator can update the community'
      });
    }
    
    // Update community
    if (description) community.description = description;
    if (category) community.category = category;
    if (isPrivate !== undefined) community.isPrivate = isPrivate;
    if (imageUrl) community.imageUrl = imageUrl;
    
    await community.save();
    
    return res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get popular communities
// @route   GET /api/communities/popular
// @access  Public
export const getPopularCommunities = async (req: Request, res: Response) => {
  try {
    // Get communities sorted by member count (most popular first)
    const communities = await Community.find()
      .populate('creator', 'username avatarUrl')
      .sort({ memberCount: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get a community by slug
// @route   GET /api/communities/slug/:slug
// @access  Public
export const getCommunityBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const community = await Community.findOne({ slug })
      .populate('creator', 'username avatarUrl')
      .populate('members', 'username avatarUrl');
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}; 