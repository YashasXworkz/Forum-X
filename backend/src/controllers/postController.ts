import { Request, Response } from 'express';
import Post from '../models/Post';
import Community from '../models/Community';
import { errorHandler } from '../utils/errorHandler';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, communityId, imageUrl } = req.body;
    const userId = req.user?._id;

    if (!title || !content || !communityId) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and community are required'
      });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Create post with optional image URL
    const post = await Post.create({
      title,
      content,
      author: userId,
      communityId,
      imageUrl: imageUrl || undefined
    });

    // Return post details with populated author field
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatarUrl')
      .populate('communityId', 'name');

    return res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatarUrl')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get community posts
// @route   GET /api/communities/:communityId/posts
// @access  Public
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    const posts = await Post.find({ communityId })
      .populate('author', 'username avatarUrl')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatarUrl')
      .populate('communityId', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (author only)
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?._id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this post'
      });
    }

    // Update post fields if provided
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username avatarUrl')
      .populate('communityId', 'name');

    return res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this post'
      });
    }
    
    await post.deleteOne();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Upvote a post
// @route   POST /api/posts/:id/upvote
// @access  Private
export const upvotePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Increment upvotes
    post.upvotes += 1;
    await post.save();
    
    return res.status(200).json({
      success: true,
      data: {
        upvotes: post.upvotes,
        downvotes: post.downvotes
      }
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

// @desc    Downvote a post
// @route   POST /api/posts/:id/downvote
// @access  Private
export const downvotePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    // Increment downvotes
    post.downvotes += 1;
    await post.save();
    
    return res.status(200).json({
      success: true,
      data: {
        upvotes: post.upvotes,
        downvotes: post.downvotes
      }
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
}; 