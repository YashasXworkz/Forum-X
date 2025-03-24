
import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Image, Link as LinkIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { usePopularCommunities } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const communityFromParams = searchParams.get("community");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>(communityFromParams || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: communities = [], isLoading: isLoadingCommunities } = usePopularCommunities();
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCommunity) {
      toast({
        title: "Community required",
        description: "Please select a community for your post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });
      
      // Redirect to the new post (mock ID for now)
      navigate("/post/1");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
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
                    {communities.map((community: any) => (
                      <SelectItem key={community.id} value={community.id}>
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
              
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="flex items-center" disabled={isSubmitting}>
                  <Image className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
                <Button type="button" variant="outline" className="flex items-center" disabled={isSubmitting}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CreatePost;
