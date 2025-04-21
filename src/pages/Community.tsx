import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Info, Plus, Users, Settings } from "lucide-react";
import { PostCard } from "@/components/post/PostCard";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// API base URL
const API_URL = "http://localhost:5000";

// Define interfaces for type safety
interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  category: string;
  imageUrl?: string;
  isPrivate: boolean;
  createdAt: string;
  creator?: string;
  members?: string[];
}

interface Post {
  _id: string;
  title: string;
  content: string;
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
}

// Make sure the CommunityHeader component expects our Community interface
interface CommunityHeaderProps {
  community: Community;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

const Community = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoadingCommunity(true);
        
        // Get community by slug
        const response = await axios.get(`${API_URL}/api/communities/slug/${slug}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const communityData = response.data.data;
        setCommunity(communityData);
        
        // Check if user is owner
        setIsOwner(communityData.creator === user?._id);
        
        // Check if user is a member
        if (user && communityData.members) {
          setIsJoined(communityData.members.includes(user._id));
        }
        
        setIsLoadingCommunity(false);
      } catch (error) {
        console.error("Error fetching community:", error);
        toast({
          title: "Error",
          description: "Failed to load community data. Please try again later.",
          variant: "destructive"
        });
        navigate("/communities");
      }
    };
    
    if (slug) {
      fetchCommunity();
    }
  }, [slug, token, user, navigate, toast]);
  
  // Fetch community posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!community) return;
      
      try {
        setIsLoadingPosts(true);
        
        const response = await axios.get(`${API_URL}/api/communities/${community._id}/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setPosts(response.data.data);
        setIsLoadingPosts(false);
      } catch (error) {
        console.error("Error fetching community posts:", error);
        setPosts([]);
        setIsLoadingPosts(false);
      }
    };
    
    if (community) {
      fetchPosts();
    }
  }, [community, token]);
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to join this community",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/communities/${community?._id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsJoined(true);
      
      toast({
        title: "Success",
        description: `You've joined ${community?.name}!`
      });
      
      // Update community member count
      setCommunity(prev => prev ? {
        ...prev,
        memberCount: prev.memberCount + 1
      } : null);
      
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleLeaveCommunity = async () => {
    try {
      await axios.post(`${API_URL}/api/communities/${community?._id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsJoined(false);
      
      toast({
        title: "Success",
        description: `You've left ${community?.name}`
      });
      
      // Update community member count
      setCommunity(prev => prev ? {
        ...prev,
        memberCount: Math.max(0, prev.memberCount - 1)
      } : null);
      
    } catch (error) {
      console.error("Error leaving community:", error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoadingCommunity) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <EmptyState
          icon={Users}
          title="Community not found"
          description="The community you're looking for doesn't exist or has been removed."
          actionLink="/communities"
          actionLabel="Browse Communities"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <CommunityHeader 
          community={community} 
          isJoined={isJoined}
          onJoin={handleJoinCommunity}
          onLeave={handleLeaveCommunity}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="discussions">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Discussions
                  </TabsTrigger>
                  <TabsTrigger value="about">
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {user && (
                <Button asChild>
                  <Link to={`/create-post?community=${community._id}`} className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Link>
                </Button>
              )}
            </div>
            
            <TabsContent value="posts" className="space-y-4">
              {isLoadingPosts ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                ))
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No posts yet"
                  description="Be the first to create a post in this community!"
                  actionLink={`/create-post?community=${community._id}`}
                  actionLabel="Create Post"
                  showAction={!!user}
                />
              )}
            </TabsContent>
            
            <TabsContent value="discussions" className="space-y-4">
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Group Discussions Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Real-time discussions will be available in this community soon.
                  </p>
                  {user && (
                    <Button variant="outline" asChild>
                      <Link to={`/create-discussion?community=${community._id}`}>Start Discussion</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="about" id="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About {community.name}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{community.description}</p>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Community Stats</h3>
                    <dl className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">Created</dt>
                        <dd className="font-medium">{new Date(community.createdAt).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Members</dt>
                        <dd className="font-medium">{community.memberCount.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Posts</dt>
                        <dd className="font-medium">{posts.length}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Category</dt>
                        <dd className="font-medium">{community.category}</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Community Rules
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">1. Be respectful</div>
                    <div className="text-muted-foreground">
                      Treat others with respect. No hate speech or harassment.
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">2. Stay on topic</div>
                    <div className="text-muted-foreground">
                      Posts should be relevant to {community.name}.
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">3. No spam</div>
                    <div className="text-muted-foreground">
                      Don't spam or self-promote without contributing.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
