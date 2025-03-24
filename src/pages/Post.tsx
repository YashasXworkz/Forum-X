
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post/PostCard";
import { CommentSection } from "@/components/post/CommentSection";
import { usePost, usePostComments } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";

const Post = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const { 
    data: post, 
    isLoading: isLoadingPost, 
    error: postError 
  } = usePost(postId || "");
  
  const {
    data: comments = [],
    isLoading: isLoadingComments
  } = usePostComments(postId || "");
  
  useEffect(() => {
    if (postError) {
      navigate("/not-found", { replace: true });
    }
  }, [postError, navigate]);
  
  if (isLoadingPost) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <PostCard post={post} isDetailed />
        
        <div className="mt-6">
          <CommentSection 
            postId={post.id} 
            comments={comments}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Post;
