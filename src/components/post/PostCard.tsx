import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share, 
  MoreHorizontal,
  Pencil,
  Trash,
  Check,
  Copy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { deletePost, upvotePost, downvotePost } from "@/lib/api";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
    author?: {
      _id: string;
      username: string;
      avatarUrl?: string;
    };
    communityId: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    commentCount: number;
  };
  onPostDeleted?: () => void;
}

export const PostCard = ({ post, onPostDeleted }: PostCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const [score, setScore] = useState(post.upvotes - post.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  const authorName = post.author?.username || "Anonymous";
  const authorInitial = authorName[0].toUpperCase();
  
  // Check if the current user is the post author
  const isAuthor = user && post.author && user._id === post.author._id;
  
  // Get user's previous vote from localStorage if available
  useEffect(() => {
    if (user) {
      const voteKey = `post_vote_${post._id}_${user._id}`;
      const savedVote = localStorage.getItem(voteKey);
      if (savedVote) {
        setUserVote(savedVote as 'up' | 'down');
      }
    }
  }, [post._id, user]);
  
  const handleEdit = () => {
    navigate(`/edit-post/${post._id}`);
  };
  
  const handleDelete = async () => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deletePost(post._id);
      
      // Invalidate all posts queries to refresh any lists
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post._id] });
      
      toast.success("Post deleted successfully");
      
      // Call the callback if provided (e.g., to refresh the post list)
      if (onPostDeleted) {
        onPostDeleted();
      } else {
        // If we're on the post detail page, navigate back
        navigate(-1);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleVote = async (direction: 'up' | 'down') => {
    // Prevent voting if already processing a vote
    if (isVoting) return;
    
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    
    // Prevent users from voting on their own posts
    if (isAuthor) {
      toast.error("You cannot vote on your own posts");
      return;
    }
    
    // Add a flag to prevent double-clicks
    setIsVoting(true);
    
    try {
      const voteKey = `post_vote_${post._id}_${user._id}`;
      const storedVote = localStorage.getItem(voteKey);
      
      // Case 1: Clicking the same button again (toggle off)
      if (storedVote === direction) {
        // Remove vote
        localStorage.removeItem(voteKey);
        
        // Call API to remove vote - note: this endpoint might not exist
        // We'll use the opposite vote to simulate removing
        try {
          if (direction === 'up') {
            await downvotePost(post._id);
          } else {
            await upvotePost(post._id);
          }
          
          // Then call the opposite again to get back to neutral
          if (direction === 'up') {
            await downvotePost(post._id);
          } else {
            await upvotePost(post._id);
          }
        } catch (err) {
          console.error("Error removing vote:", err);
        }
        
        // Update local state
        setUserVote(null);
        
        // Fetch fresh post data using the existing API
        try {
          const response = await api.get(`/api/posts/${post._id}`);
          const freshPost = response.data.data;
          setScore(freshPost.upvotes - freshPost.downvotes);
        } catch (err) {
          console.error("Error fetching updated post:", err);
        }
        
        // Update global state
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        return;
      }
      
      // Case 2: First vote or changing vote direction
      if (direction === 'up') {
        // If changing from down to up, we need to cancel the down first
        if (storedVote === 'down') {
          await downvotePost(post._id); // Cancel the down vote
        }
        await upvotePost(post._id);
      } else {
        // If changing from up to down, we need to cancel the up first
        if (storedVote === 'up') {
          await upvotePost(post._id); // Cancel the up vote
        }
        await downvotePost(post._id);
      }
      
      // Store the new vote
      localStorage.setItem(voteKey, direction);
      
      // Update local state
      setUserVote(direction);
      
      // Fetch fresh post data
      try {
        const response = await api.get(`/api/posts/${post._id}`);
        const freshPost = response.data.data;
        setScore(freshPost.upvotes - freshPost.downvotes);
      } catch (err) {
        console.error("Error fetching updated post:", err);
      }
      
      // Update global state
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error(`Error processing vote:`, error);
      toast.error("Failed to register vote. Please try again.");
      
      // Refresh the post to get accurate data
      try {
        const response = await api.get(`/api/posts/${post._id}`);
        const freshPost = response.data.data;
        setScore(freshPost.upvotes - freshPost.downvotes);
        
        // Determine user's actual vote state from localStorage
        const voteKey = `post_vote_${post._id}_${user._id}`;
        const storedVote = localStorage.getItem(voteKey);
        setUserVote(storedVote as 'up' | 'down' | null);
      } catch (refreshError) {
        console.error("Error refreshing post data:", refreshError);
      }
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    });
  };
  
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this post: ${post.title}`,
          url: postUrl
        });
        toast.success("Post shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
        // Fall back to dialog if sharing fails
        setIsSharing(true);
      }
    } else {
      // If Web Share API is not supported, show the share dialog
      setIsSharing(true);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {authorInitial}
            </AvatarFallback>
            {post.author?.avatarUrl && (
              <AvatarImage src={post.author.avatarUrl} alt={authorName} />
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Link to={`/profile/${authorName}`} className="font-medium text-foreground hover:underline">
                  {authorName}
                </Link>
                <span className="mx-1">•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {/* Edit/Delete dropdown for post author */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>{isDeleting ? "Deleting..." : "Delete post"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <Link to={`/post/${post._id}`}>
              <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
            
            <div className="mt-2">
              <p className="text-sm line-clamp-3">{post.content}</p>
            </div>
            
            {/* Display post image if available */}
            {post.imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-auto max-h-[300px] object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 bg-muted/30 flex justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${userVote === 'up' ? 'text-primary bg-primary/10' : ''}`}
              onClick={() => handleVote('up')}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-medium">{score}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${userVote === 'down' ? 'text-destructive bg-destructive/10' : ''}`}
              onClick={() => handleVote('down')}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          
          <Link 
            to={`/post/${post._id}`}
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount}</span>
          </Link>
        </div>
        
        <Dialog open={isSharing} onOpenChange={setIsSharing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleShare}>
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share this post</DialogTitle>
              <DialogDescription>
                Copy the link below or share directly to your favorite platform
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-4">
              <Input 
                value={`${window.location.origin}/post/${post._id}`}
                readOnly
                className="flex-1"
              />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}&text=${encodeURIComponent(`Check out this post: ${post.title}`)}`, '_blank');
                }}
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}`, '_blank');
                }}
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/post/${post._id}`)}`, '_blank');
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`mailto:?subject=${encodeURIComponent(`Check out this post: ${post.title}`)}&body=${encodeURIComponent(`I thought you might be interested in this post:\n\n${post.title}\n\n${window.location.origin}/post/${post._id}`)}`, '_blank');
                }}
              >
                Email
              </Button>
            </div>
            <DialogClose asChild>
              <Button variant="secondary" className="mt-4">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
