
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, MessageSquare, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorUsername: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export const CommentSection = ({ postId, comments }: CommentSectionProps) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some text for your comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
      
      setCommentText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Post a Comment</h3>
        
        {user ? (
          <div className="space-y-4">
            <Textarea 
              className="min-h-32"
              placeholder="What are your thoughts?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-secondary p-4 rounded-md text-center">
            <p className="mb-2">You need to be logged in to comment</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  level?: number;
}

const CommentItem = ({ comment, level = 0 }: CommentItemProps) => {
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(null);
  const [voteCount, setVoteCount] = useState(comment.upvotes - comment.downvotes);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  
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
  
  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Reply added",
        description: "Your reply has been posted",
      });
      
      setIsReplying(false);
      setReplyText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your reply",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={`${level > 0 ? "ml-6 pl-4 border-l border-border" : ""}`}>
      <div className="flex items-start space-x-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{comment.authorUsername.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Link to={`/profile/${comment.authorUsername}`} className="font-medium hover:underline">
              {comment.authorUsername}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="mt-1">
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full ${voteStatus === "up" ? "text-primary bg-primary/10" : ""}`}
                onClick={() => handleVote("up")}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Upvote</span>
              </Button>
              
              <span className="text-xs font-medium">{voteCount}</span>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full ${voteStatus === "down" ? "text-destructive bg-destructive/10" : ""}`}
                onClick={() => handleVote("down")}
              >
                <ArrowDown className="h-4 w-4" />
                <span className="sr-only">Downvote</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </Button>
            
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </div>
          
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                className="min-h-24 text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmitReply}>
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
