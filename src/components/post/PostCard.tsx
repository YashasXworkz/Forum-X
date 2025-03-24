
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
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
    imageUrl?: string;
  };
  isDetailed?: boolean;
}

export const PostCard = ({ post, isDetailed = false }: PostCardProps) => {
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleVote = (direction: "up" | "down") => {
    if (voteStatus === direction) {
      // Removing vote
      setVoteStatus(null);
      setVoteCount(direction === "up" ? voteCount - 1 : voteCount + 1);
    } else {
      // Changing vote or adding new vote
      setVoteStatus(direction);
      if (voteStatus === null) {
        setVoteCount(direction === "up" ? voteCount + 1 : voteCount - 1);
      } else {
        setVoteCount(direction === "up" ? voteCount + 2 : voteCount - 2);
      }
    }
  };
  
  const formatContent = (content: string) => {
    if (!isDetailed && content.length > 200) {
      return content.substring(0, 200) + "...";
    }
    return content;
  };
  
  return (
    <Card className="glass-panel hover:shadow-glass-hover mb-4 overflow-hidden">
      <div className="flex">
        {/* Vote sidebar */}
        <div className="bg-secondary/50 flex flex-col items-center p-2 space-y-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${voteStatus === "up" ? "text-primary bg-primary/10" : ""}`}
            onClick={() => handleVote("up")}
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Upvote</span>
          </Button>
          
          <span className="text-sm font-medium">{voteCount}</span>
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${voteStatus === "down" ? "text-destructive bg-destructive/10" : ""}`}
            onClick={() => handleVote("down")}
          >
            <ArrowDown className="h-5 w-5" />
            <span className="sr-only">Downvote</span>
          </Button>
        </div>
        
        {/* Post content */}
        <div className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{post.authorUsername.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <Link 
                to={`/community/${post.communitySlug}`}
                className="text-sm font-medium hover:underline"
              >
                {post.communityName}
              </Link>
              
              <span className="text-muted-foreground text-sm">•</span>
              
              <span className="text-sm text-muted-foreground">
                Posted by{" "}
                <Link 
                  to={`/profile/${post.authorUsername}`}
                  className="hover:underline"
                >
                  u/{post.authorUsername}
                </Link>
                {" "}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {isDetailed ? (
              <div>
                <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{formatContent(post.content)}</p>
              </div>
            ) : (
              <Link to={`/post/${post.id}`} className="block">
                <h2 className="text-xl font-semibold mb-3 hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-foreground leading-relaxed">{formatContent(post.content)}</p>
              </Link>
            )}
            
            {post.imageUrl && (
              <div className={`mt-3 ${!isDetailed && "max-h-80 overflow-hidden"}`}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full rounded-md object-cover"
                />
              </div>
            )}
          </CardContent>
          
          <Separator />
          
          <CardFooter className="p-2 flex justify-between">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild={!isDetailed} className="text-muted-foreground">
                {isDetailed ? (
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{post.commentCount} Comments</span>
                  </div>
                ) : (
                  <Link to={`/post/${post.id}`} className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{post.commentCount} Comments</span>
                  </Link>
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share className="mr-1 h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground ${isSaved ? "text-primary" : ""}`}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className="mr-1 h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
