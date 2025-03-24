
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSlug } from "./utils";

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

// Mock Data
const MOCK_COMMUNITIES: Community[] = [
  {
    id: "1",
    name: "Technology",
    slug: "technology",
    description: "Discuss the latest in tech news, gadgets, and software.",
    memberCount: 12500,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: true
  },
  {
    id: "2",
    name: "Gaming",
    slug: "gaming",
    description: "A community for gaming enthusiasts to share news, memes, and discussions.",
    memberCount: 8900,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: true
  },
  {
    id: "3",
    name: "Science",
    slug: "science",
    description: "Exploring scientific breakthroughs, research, and curiosities.",
    memberCount: 6200,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: true
  },
  {
    id: "4",
    name: "Photography",
    slug: "photography",
    description: "Share your photos, techniques, and gear discussions.",
    memberCount: 4500,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: false
  },
  {
    id: "5",
    name: "Movies",
    slug: "movies",
    description: "Discuss films, directors, and everything cinema.",
    memberCount: 7300,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: true
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "The Future of AI in Everyday Life",
    content: "Artificial intelligence is rapidly transforming how we interact with technology...",
    authorId: "1",
    authorUsername: "johnsmith",
    communityId: "1",
    communityName: "Technology",
    communitySlug: "technology",
    upvotes: 235,
    downvotes: 12,
    commentCount: 48,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    imageUrl: ""
  },
  {
    id: "2",
    title: "What's your favorite indie game of 2023?",
    content: "I've been playing a lot of indie games lately and wanted to share my favorites...",
    authorId: "2",
    authorUsername: "gamer123",
    communityId: "2",
    communityName: "Gaming",
    communitySlug: "gaming",
    upvotes: 189,
    downvotes: 5,
    commentCount: 76,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    imageUrl: ""
  },
  {
    id: "3",
    title: "New breakthrough in quantum computing announced",
    content: "Researchers have achieved a significant milestone in quantum computing that could revolutionize...",
    authorId: "3",
    authorUsername: "sciencefan",
    communityId: "3",
    communityName: "Science",
    communitySlug: "science",
    upvotes: 412,
    downvotes: 8,
    commentCount: 32,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    imageUrl: ""
  },
  {
    id: "4",
    title: "Sunset shot with my new camera - feedback welcome",
    content: "I just got a new Sony A7III and took this sunset shot. Would love some constructive feedback...",
    authorId: "4",
    authorUsername: "photolover",
    communityId: "4",
    communityName: "Photography",
    communitySlug: "photography",
    upvotes: 98,
    downvotes: 2,
    commentCount: 15,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "5",
    title: "Top 10 must-watch films of all time",
    content: "After years of watching movies, I've compiled my list of the top 10 must-watch films...",
    authorId: "5",
    authorUsername: "cinephile",
    communityId: "5",
    communityName: "Movies",
    communitySlug: "movies",
    upvotes: 276,
    downvotes: 34,
    commentCount: 92,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    imageUrl: ""
  }
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    postId: "1",
    authorId: "2",
    authorUsername: "gamer123",
    content: "This is a fascinating perspective on AI. I think we're only scratching the surface of what's possible.",
    upvotes: 42,
    downvotes: 2,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    replies: [
      {
        id: "101",
        postId: "1",
        parentId: "1",
        authorId: "1",
        authorUsername: "johnsmith",
        content: "Thanks! I'm particularly excited about AI in healthcare.",
        upvotes: 15,
        downvotes: 0,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ]
  },
  {
    id: "2",
    postId: "1",
    authorId: "3",
    authorUsername: "sciencefan",
    content: "I have some concerns about AI ethics that I think aren't addressed enough in the tech community.",
    upvotes: 28,
    downvotes: 5,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    replies: []
  }
];

// API Mock Functions
const fetchAllCommunities = async (): Promise<Community[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_COMMUNITIES;
};

const fetchPopularCommunities = async (): Promise<Community[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_COMMUNITIES.filter(community => community.isPopular);
};

const fetchCommunity = async (slug: string): Promise<Community> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  const community = MOCK_COMMUNITIES.find(c => c.slug === slug);
  if (!community) {
    throw new Error(`Community with slug '${slug}' not found`);
  }
  return community;
};

const fetchAllPosts = async (): Promise<Post[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_POSTS;
};

const fetchCommunityPosts = async (communitySlug: string): Promise<Post[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_POSTS.filter(post => post.communitySlug === communitySlug);
};

const fetchPost = async (postId: string): Promise<Post> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  const post = MOCK_POSTS.find(p => p.id === postId);
  if (!post) {
    throw new Error(`Post with ID '${postId}' not found`);
  }
  return post;
};

const fetchPostComments = async (postId: string): Promise<Comment[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_COMMENTS.filter(comment => comment.postId === postId);
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

export const useCommunityPosts = (communitySlug: string) => {
  return useQuery({
    queryKey: ["communityPosts", communitySlug],
    queryFn: () => fetchCommunityPosts(communitySlug),
    enabled: !!communitySlug,
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newCommunity: Community = {
    id: (MOCK_COMMUNITIES.length + 1).toString(),
    name: data.name,
    slug: createSlug(data.name),
    description: data.description,
    memberCount: 1,
    imageUrl: "",
    createdAt: new Date().toISOString(),
    isPopular: false
  };
  
  // In a real app, this would be an API call to create the community
  MOCK_COMMUNITIES.push(newCommunity);
  
  return newCommunity;
};

export const createPost = async (data: { 
  title: string; 
  content: string; 
  communityId: string;
  communityName: string;
  communitySlug: string;
  authorId: string;
  authorUsername: string;
  imageUrl?: string;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newPost: Post = {
    id: (MOCK_POSTS.length + 1).toString(),
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    authorUsername: data.authorUsername,
    communityId: data.communityId,
    communityName: data.communityName,
    communitySlug: data.communitySlug,
    upvotes: 0,
    downvotes: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    imageUrl: data.imageUrl || ""
  };
  
  // In a real app, this would be an API call to create the post
  MOCK_POSTS.push(newPost);
  
  return newPost;
};

export const createComment = async (data: { 
  postId: string; 
  content: string;
  authorId: string;
  authorUsername: string;
  parentId?: string;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (data.parentId) {
    // This is a reply to an existing comment
    const reply: Reply = {
      id: Math.random().toString(36).substring(2, 15),
      postId: data.postId,
      parentId: data.parentId,
      authorId: data.authorId,
      authorUsername: data.authorUsername,
      content: data.content,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString()
    };
    
    // Find the parent comment and add this reply
    const parentComment = MOCK_COMMENTS.find(c => c.id === data.parentId);
    if (parentComment) {
      parentComment.replies.push(reply);
    }
    
    return reply;
  } else {
    // This is a new top-level comment
    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 15),
      postId: data.postId,
      authorId: data.authorId,
      authorUsername: data.authorUsername,
      content: data.content,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      replies: []
    };
    
    // In a real app, this would be an API call to create the comment
    MOCK_COMMENTS.push(newComment);
    
    // Update the comment count on the post
    const post = MOCK_POSTS.find(p => p.id === data.postId);
    if (post) {
      post.commentCount += 1;
    }
    
    return newComment;
  }
};

export const voteOnPost = async (postId: string, vote: 'up' | 'down') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const post = MOCK_POSTS.find(p => p.id === postId);
  if (!post) {
    throw new Error(`Post with ID '${postId}' not found`);
  }
  
  if (vote === 'up') {
    post.upvotes += 1;
  } else {
    post.downvotes += 1;
  }
  
  return post;
};

export const voteOnComment = async (commentId: string, vote: 'up' | 'down') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const comment = MOCK_COMMENTS.find(c => c.id === commentId);
  if (!comment) {
    // Check if it's a reply
    for (const parentComment of MOCK_COMMENTS) {
      const reply = parentComment.replies.find(r => r.id === commentId);
      if (reply) {
        if (vote === 'up') {
          reply.upvotes += 1;
        } else {
          reply.downvotes += 1;
        }
        return reply;
      }
    }
    throw new Error(`Comment with ID '${commentId}' not found`);
  }
  
  if (vote === 'up') {
    comment.upvotes += 1;
  } else {
    comment.downvotes += 1;
  }
  
  return comment;
};
