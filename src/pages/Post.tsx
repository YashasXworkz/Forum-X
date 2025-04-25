import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/post/PostCard";
import { CommentSection } from "@/components/post/CommentSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePost, usePostComments } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Post = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch post data
  const { 
    data: post, 
    isLoading: isLoadingPost, 
    error: postError
  } = usePost(postId || "");
  
  // Fetch comments for the post with shorter stale time for quicker updates
  const { 
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments
  } = usePostComments(postId || "");
  
  // Setup periodic comment refetching to ensure new replies appear
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (postId) {
        refetchComments();
      }
    }, 10000); // Refetch every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [postId, refetchComments]);
  
  useEffect(() => {
    if (postError) {
      toast.error("Failed to load post data");
      // Still navigate away if the post is truly not found
      if ((postError as any)?.response?.status === 404) {
        navigate("/not-found", { replace: true });
      }
    }
    
    if (commentsError) {
      toast.error("Failed to load comments");
    }
  }, [postError, commentsError, navigate]);
  
  // Handle post deletion
  const handlePostDeleted = () => {
    // Navigate back after successful deletion
    navigate(-1);
  };
  
  if (isLoadingPost) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-4 overflow-visible">
          <div className="mb-4">
            <div className="h-8 w-40 rounded-md bg-gray-200 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-1/4 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="h-40 w-full rounded-md bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!post && !isLoadingPost) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto overflow-visible">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Post not found</h2>
            <p className="mt-2 text-muted-foreground">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Get the post ID - handle both id or _id formats
  const effectivePostId = post ? (post.id || (post as any)._id || "") : "";
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-2 overflow-visible">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        
        {post && (
          <>
            {/* Use type assertion to satisfy the PostCard component */}
            <PostCard post={post as any} onPostDeleted={handlePostDeleted} />
            
            <CommentSection 
              postId={effectivePostId}
              comments={comments}
            />
            
            {/* Float button to refresh comments */}
            <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-10">
              <Button 
                variant="secondary" 
                size="sm" 
                className="shadow-md"
                onClick={() => refetchComments()}
              >
                Refresh Comments
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Post;
