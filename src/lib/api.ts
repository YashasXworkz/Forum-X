
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Mock data for communities
const MOCK_COMMUNITIES = [
  {
    id: "1",
    name: "Technology",
    slug: "technology",
    description: "Discuss the latest in tech, programming, and digital innovation.",
    memberCount: 12580,
    imageUrl: "",
    createdAt: "2023-01-15T00:00:00.000Z",
    isPopular: true
  },
  {
    id: "2",
    name: "Photography",
    slug: "photography",
    description: "Share your best shots and discuss photography techniques.",
    memberCount: 8420,
    imageUrl: "",
    createdAt: "2023-02-10T00:00:00.000Z",
    isPopular: true
  },
  {
    id: "3",
    name: "Gaming",
    slug: "gaming",
    description: "Everything related to video games, consoles, and gaming culture.",
    memberCount: 15730,
    imageUrl: "",
    createdAt: "2023-01-05T00:00:00.000Z",
    isPopular: true
  },
  {
    id: "4",
    name: "Books",
    slug: "books",
    description: "Discover new reads and discuss literature of all genres.",
    memberCount: 6240,
    imageUrl: "",
    createdAt: "2023-03-20T00:00:00.000Z",
    isPopular: true
  },
  {
    id: "5",
    name: "Fitness",
    slug: "fitness",
    description: "Tips, routines, and motivation for staying fit and healthy.",
    memberCount: 9380,
    imageUrl: "",
    createdAt: "2023-02-25T00:00:00.000Z",
    isPopular: true
  }
];

// Mock data for posts
const MOCK_POSTS = [
  {
    id: "1",
    title: "The future of AI in everyday applications",
    content: "As AI continues to evolve, we're seeing more integration into daily applications. What are your thoughts on how this will shape our interaction with technology in the next decade?",
    authorId: "1",
    authorUsername: "johnsmith",
    communityId: "1",
    communityName: "Technology",
    communitySlug: "technology",
    upvotes: 428,
    downvotes: 12,
    commentCount: 86,
    createdAt: "2023-06-15T10:30:00.000Z",
    imageUrl: ""
  },
  {
    id: "2",
    title: "Sunset photography techniques",
    content: "I've been trying to capture better sunset photos. What settings and techniques do you recommend for vibrant colors without overexposure?",
    authorId: "2",
    authorUsername: "photoexpert",
    communityId: "2",
    communityName: "Photography",
    communitySlug: "photography",
    upvotes: 315,
    downvotes: 8,
    commentCount: 42,
    createdAt: "2023-06-14T16:45:00.000Z",
    imageUrl: ""
  },
  {
    id: "3",
    title: "Game review: Latest RPG release",
    content: "Just finished playing through the new RPG that was released last week. Here are my thoughts on the gameplay, story, and graphics...",
    authorId: "3",
    authorUsername: "gamerguy",
    communityId: "3",
    communityName: "Gaming",
    communitySlug: "gaming",
    upvotes: 521,
    downvotes: 24,
    commentCount: 97,
    createdAt: "2023-06-13T20:15:00.000Z",
    imageUrl: ""
  },
  {
    id: "4",
    title: "Monthly book recommendation thread",
    content: "What books are you currently reading? Share your recommendations for this month!",
    authorId: "4",
    authorUsername: "bookworm",
    communityId: "4",
    communityName: "Books",
    communitySlug: "books",
    upvotes: 267,
    downvotes: 5,
    commentCount: 124,
    createdAt: "2023-06-12T12:00:00.000Z",
    imageUrl: ""
  },
  {
    id: "5",
    title: "Home workout routine for beginners",
    content: "I've put together a beginner-friendly home workout routine that doesn't require any equipment. Here's the breakdown of exercises...",
    authorId: "5",
    authorUsername: "fitnesscoach",
    communityId: "5",
    communityName: "Fitness",
    communitySlug: "fitness",
    upvotes: 389,
    downvotes: 11,
    commentCount: 63,
    createdAt: "2023-06-11T09:20:00.000Z",
    imageUrl: ""
  }
];

// Mock data for comments
const MOCK_COMMENTS = [
  {
    id: "1",
    postId: "1",
    authorId: "2",
    authorUsername: "techexpert",
    content: "I think we'll see AI becoming more context-aware, making interactions feel more natural. The challenge will be balancing convenience with privacy concerns.",
    upvotes: 124,
    downvotes: 3,
    createdAt: "2023-06-15T11:45:00.000Z",
    replies: []
  },
  {
    id: "2",
    postId: "1",
    authorId: "3",
    authorUsername: "digitalfuturist",
    content: "The most exciting aspect is personalization. AI will continue to adapt to individual preferences, making technology feel like a true extension of ourselves.",
    upvotes: 92,
    downvotes: 5,
    createdAt: "2023-06-15T13:20:00.000Z",
    replies: [
      {
        id: "3",
        postId: "1",
        parentId: "2",
        authorId: "1",
        authorUsername: "johnsmith",
        content: "That's a great point. Do you think there's a risk of creating echo chambers with such personalization?",
        upvotes: 47,
        downvotes: 1,
        createdAt: "2023-06-15T14:10:00.000Z"
      }
    ]
  }
];

// Mock function to fetch popular communities
const fetchPopularCommunities = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_COMMUNITIES.filter(community => community.isPopular);
};

// Mock function to fetch trending posts
const fetchTrendingPosts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Sort by upvotes as a simple "trending" algorithm
  return [...MOCK_POSTS].sort((a, b) => b.upvotes - a.upvotes);
};

// Mock function to fetch a single community by slug
const fetchCommunity = async (slug: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  const community = MOCK_COMMUNITIES.find(c => c.slug === slug);
  if (!community) {
    throw new Error("Community not found");
  }
  return community;
};

// Mock function to fetch posts for a community
const fetchCommunityPosts = async (communityId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_POSTS.filter(post => post.communityId === communityId);
};

// Mock function to fetch a single post by id
const fetchPost = async (postId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const post = MOCK_POSTS.find(p => p.id === postId);
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};

// Mock function to fetch comments for a post
const fetchPostComments = async (postId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  return MOCK_COMMENTS.filter(comment => comment.postId === postId);
};

// React Query hooks
export const usePopularCommunities = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["popular-communities"],
    queryFn: fetchPopularCommunities,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch popular communities",
        variant: "destructive",
      });
    },
  });
};

export const useTrendingPosts = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["trending-posts"],
    queryFn: fetchTrendingPosts,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch trending posts",
        variant: "destructive",
      });
    },
  });
};

export const useCommunity = (slug: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["community", slug],
    queryFn: () => fetchCommunity(slug),
    enabled: !!slug,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to fetch community: ${slug}`,
        variant: "destructive",
      });
    },
  });
};

export const useCommunityPosts = (communityId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["community-posts", communityId],
    queryFn: () => fetchCommunityPosts(communityId),
    enabled: !!communityId,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to fetch posts for community`,
        variant: "destructive",
      });
    },
  });
};

export const usePost = (postId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to fetch post: ${postId}`,
        variant: "destructive",
      });
    },
  });
};

export const usePostComments = (postId: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => fetchPostComments(postId),
    enabled: !!postId,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to fetch comments for post`,
        variant: "destructive",
      });
    },
  });
};
