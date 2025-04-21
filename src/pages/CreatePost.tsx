import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon, Loader2, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { createPost } from "../lib/api";

// API base URL
const API_URL = "http://localhost:5000";

// Define interface for community data
interface Community {
  _id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

const CreatePost = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const communityFromParams = searchParams.get("community");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>(communityFromParams || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoadingCommunities(true);
      try {
        const response = await api.get('/api/communities');
        
        // Check for both response formats
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setCommunities(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCommunities(response.data);
        } else {
          throw new Error("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast({
          title: "Error loading communities",
          description: "Failed to load communities. Please try again.",
          variant: "destructive"
        });
        setCommunities([]);
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    
    fetchCommunities();
  }, [token]);
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a post",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate]);
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImageUrl(response.data.data.imageUrl);
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove uploaded image
  const removeImage = () => {
    setImageUrl("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your post",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCommunity) {
      toast({
        title: "Community required",
        description: "Please select a community for your post",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the selected community
      const selectedCommunityData = communities.find(c => c._id === selectedCommunity);
      
      if (!selectedCommunityData) {
        toast({
          title: "Community not found",
          description: "Selected community not found",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create post using the API
      const response = await api.post('/api/posts', {
        title,
        content,
        communityId: selectedCommunity,
        imageUrl: imageUrl || undefined
      });
      
      toast({
        title: "Post created",
        description: "Your post has been created successfully!",
      });
      
      const postId = response.data.data._id;
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Post creation failed",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-fade-in">
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
        
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                <Select
                  value={selectedCommunity}
                  onValueChange={setSelectedCommunity}
                  disabled={isLoadingCommunities || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community) => (
                      <SelectItem key={community._id} value={community._id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your post a title"
                  disabled={isSubmitting}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/300
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[200px]"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Image preview */}
              {imageUrl && (
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img 
                    src={imageUrl} 
                    alt="Post image" 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                    onClick={removeImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center relative"
                  disabled={isSubmitting || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {imageUrl ? "Change Image" : "Add Image"}
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center" 
                  disabled={isSubmitting}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CreatePost;
