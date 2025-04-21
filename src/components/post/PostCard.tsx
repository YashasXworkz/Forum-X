import React, { useState } from "react";
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
  Trash
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { deletePost } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  const score = post.upvotes - post.downvotes;
  const authorName = post.author?.username || "Anonymous";
  const authorInitial = authorName[0].toUpperCase();
  
  // Check if the current user is the post author
  const isAuthor = user && post.author && user._id === post.author._id;
  
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
                <span className="font-medium text-foreground">
                  {authorName}
                </span>
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-medium">{score}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
        
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Share className="h-4 w-4 mr-1" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};
