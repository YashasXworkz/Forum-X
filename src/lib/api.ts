import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import api from './axios';

// Types
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  imageUrl: string;
  createdAt: string;
  isPopular: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  communityId: string;
  communityName: string;
  communitySlug: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  imageUrl: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies: Reply[];
}

export interface Reply extends Omit<Comment, 'replies'> {
  parentId: string;
}

// Use environment variables for API URL with fallback
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Updated API Functions with real endpoints
const fetchAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get('/api/posts');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
};

const fetchAllCommunities = async (): Promise<Community[]> => {
  try {
    const response = await api.get('/api/communities');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw new Error("Failed to fetch communities");
  }
};

const fetchPopularCommunities = async (): Promise<Community[]> => {
  try {
    const response = await api.get('/api/communities/popular');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    throw new Error("Failed to fetch popular communities");
  }
};

const fetchCommunity = async (slug: string): Promise<Community> => {
  try {
    const response = await api.get(`/api/communities/slug/${slug}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching community:", error);
    throw new Error("Failed to fetch community");
  }
};

const fetchCommunityPosts = async (communityId: string): Promise<Post[]> => {
  try {
    const response = await api.get(`/api/communities/${communityId}/posts`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw new Error("Failed to fetch community posts");
  }
};

const fetchPost = async (postId: string): Promise<Post> => {
  try {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Failed to fetch post");
  }
};

const fetchPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/api/posts/${postId}/comments`);
    const comments = response.data.data;
    
    // Build a properly nested comment structure
    return buildNestedCommentStructure(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

// Helper function to build a properly nested comment tree structure
const buildNestedCommentStructure = (comments: any[]): Comment[] => {
  if (!comments || !Array.isArray(comments)) {
    console.error("Invalid comments data received:", comments);
    return [];
  }
  
  console.log('Raw comments from API:', comments);
  
  // Create a map of comments by ID for quick lookup
  const commentMap = new Map();
  comments.forEach(comment => {
    // Make a copy with empty replies array if not already present
    commentMap.set(comment.id, {
      ...comment,
      replies: comment.replies || []
    });
  });
  
  // Create the tree structure - top level comments and their replies
  const rootComments: Comment[] = [];
  const processedIds = new Set();
  
  // First pass: organize comments that already have a "replies" array
  comments.forEach(comment => {
    if (!comment.parentId && commentMap.has(comment.id)) {
      const commentWithReplies = commentMap.get(comment.id);
      rootComments.push(commentWithReplies);
      processedIds.add(comment.id);
    }
  });
  
  // Second pass: organize comments that need to be added to parent's replies
  comments.forEach(comment => {
    if (comment.parentId && !processedIds.has(comment.id)) {
      const commentWithReplies = commentMap.get(comment.id);
      const parent = commentMap.get(comment.parentId);
      
      if (parent) {
        // Check if this reply already exists in the parent's replies array
        const replyExists = parent.replies.some((reply: any) => reply.id === comment.id);
        
        if (!replyExists) {
          parent.replies.push(commentWithReplies);
        }
        processedIds.add(comment.id);
      } else {
        console.warn(`Parent comment ${comment.parentId} not found for comment ${comment.id}`);
        // If parent not found, add as a top-level comment
        rootComments.push(commentWithReplies);
        processedIds.add(comment.id);
      }
    } else if (!comment.parentId && !processedIds.has(comment.id)) {
      // This is a top-level comment that wasn't processed in the first pass
      rootComments.push(commentMap.get(comment.id));
      processedIds.add(comment.id);
    }
  });
  
  console.log('Structured comments tree:', rootComments);
  return rootComments;
};

// React Query Hooks
export const useAllCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: fetchAllCommunities,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch communities: ${error.message}`);
      }
    }
  });
};

export const usePopularCommunities = () => {
  return useQuery({
    queryKey: ["popularCommunities"],
    queryFn: fetchPopularCommunities,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch popular communities: ${error.message}`);
      }
    }
  });
};

// Add the missing useTrendingPosts function
export const useTrendingPosts = () => {
  return useQuery({
    queryKey: ["trendingPosts"],
    queryFn: fetchAllPosts, // Using fetchAllPosts as a substitute for trending posts
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch trending posts: ${error.message}`);
      }
    }
  });
};

export const useAllPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchAllPosts,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch posts: ${error.message}`);
      }
    }
  });
};

export const useCommunity = (slug: string) => {
  return useQuery({
    queryKey: ["community", slug],
    queryFn: () => fetchCommunity(slug),
    enabled: !!slug,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch community: ${error.message}`);
      }
    }
  });
};

export const useCommunityPosts = (communityId: string) => {
  return useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: () => fetchCommunityPosts(communityId),
    enabled: !!communityId,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch community posts: ${error.message}`);
      }
    }
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch post: ${error.message}`);
      }
    }
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ["postComments", postId],
    queryFn: () => fetchPostComments(postId),
    enabled: !!postId,
    staleTime: 5000,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to fetch comments: ${error.message}`);
      }
    }
  });
};

// Mutation functions
export const createCommunity = async (data: { name: string; description: string }) => {
  try {
    const response = await api.post('/api/communities', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating community:', error);
    throw new Error('Failed to create community');
  }
};

export const createPost = async (postData: Omit<Post, 'id' | 'author' | 'createdAt' | 'upvotes' | 'downvotes' | 'commentCount'>): Promise<Post> => {
  try {
    const response = await api.post('/api/posts', postData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
};

export const updatePost = async (postId: string, postData: Partial<Post>): Promise<Post> => {
  try {
    const response = await api.put(`/api/posts/${postId}`, postData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('Failed to update post');
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await api.delete(`/api/posts/${postId}`);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post');
  }
};

export const upvotePost = async (postId: string): Promise<Post> => {
  try {
    const response = await api.post(`/api/posts/${postId}/upvote`, {});
    return response.data.data;
  } catch (error) {
    console.error('Error upvoting post:', error);
    throw new Error('Failed to upvote post');
  }
};

export const downvotePost = async (postId: string): Promise<Post> => {
  try {
    const response = await api.post(`/api/posts/${postId}/downvote`, {});
    return response.data.data;
  } catch (error) {
    console.error('Error downvoting post:', error);
    throw new Error('Failed to downvote post');
  }
};

export const createComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
  try {
    // Build the correct request body
    const requestBody = {
      content: content.trim()
    };
    
    // Only add parentId if it exists
    if (parentId) {
      requestBody['parentId'] = parentId;
    }
    
    const response = await api.post(`/api/posts/${postId}/comments`, requestBody);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating comment:', error);
    
    // Log more detailed error information
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
      throw new Error(`Failed to create comment: ${error.response.data.error || 'Unknown server error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      throw new Error('Server did not respond. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
