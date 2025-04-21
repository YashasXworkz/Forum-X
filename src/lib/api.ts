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
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
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
