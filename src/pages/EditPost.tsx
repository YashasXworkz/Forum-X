import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { usePost, updatePost } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const EditPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch the post data
  const { 
    data: post, 
    isLoading: isLoadingPost, 
    error: postError 
  } = usePost(postId || '');
  
  // Set form data when post is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);
  
  // Check if user is authorized to edit this post
  useEffect(() => {
    if (post && user) {
      // Cast post to any to handle different structures
      const typedPost = post as any;
      const authorId = typedPost.authorId || (typedPost.author && typedPost.author._id);
      const userId = user._id;
      
      if (authorId && authorId !== userId) {
        toast.error('You are not authorized to edit this post');
        navigate(`/post/${postId}`);
      }
    }
  }, [post, user, postId, navigate]);
  
  // Handle errors
  useEffect(() => {
    if (postError) {
      toast.error('Failed to load post. Please try again.');
      navigate('/');
    }
  }, [postError, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedPost = await updatePost(postId || '', { title, content });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Update the post in the cache directly for immediate UI update
      queryClient.setQueryData(['post', postId], updatedPost);
      
      toast.success('Post updated successfully');
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingPost) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
              maxLength={200}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              required
              rows={8}
              className="w-full resize-y"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Post'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditPost; 