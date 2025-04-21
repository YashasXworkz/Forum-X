import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Clock, User, Plus, Compass, PenLine, MessageSquare, FolderPlus } from "lucide-react";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout/Layout";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";
import axios from "axios";

// API base URL
const API_URL = "http://localhost:5000";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
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

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  imageUrl?: string;
  isPrivate: boolean;
  createdAt: string;
}

const Home = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";
  const isNsfw = theme === "nsfw";
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  
  // Fetch real posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const response = await axios.get(`${API_URL}/api/posts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive"
        });
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    
    fetchPosts();
  }, [token]);
  
  // Fetch real communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoadingCommunities(true);
      try {
        const response = await axios.get(`${API_URL}/api/communities/popular`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setCommunities(response.data.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    
    fetchCommunities();
  }, [token]);
  
  // Handle joining a community
  const handleJoinCommunity = async (communityId: string) => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to join a community",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await axios.post(
        `${API_URL}/api/communities/${communityId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setJoinedCommunities(prev => [...prev, communityId]);
      
      // Update local community member count
      setCommunities(prev => 
        prev.map(community => 
          community._id === communityId 
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        )
      );
      
      toast({
        title: "Joined community",
        description: "You have successfully joined this community",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle leaving a community
  const handleLeaveCommunity = async (communityId: string) => {
    if (!user || !token) return;
    
    try {
      await axios.post(
        `${API_URL}/api/communities/${communityId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setJoinedCommunities(prev => prev.filter(id => id !== communityId));
      
      // Update local community member count
      setCommunities(prev => 
        prev.map(community => 
          community._id === communityId 
            ? { ...community, memberCount: Math.max(community.memberCount - 1, 0) }
            : community
        )
      );
      
      toast({
        title: "Left community",
        description: "You have left this community",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Mobile-only Create Post button for better accessibility */}
          <div className="flex md:hidden mb-4 justify-center">
            <Button 
              asChild
              size="lg"
              className={cn(
                "w-full",
                isMatrix && "matrix-button",
                isNsfw && "nsfw-button"
              )}
            >
              <Link to="/create-post" className="flex items-center justify-center">
                <PenLine className="mr-2 h-5 w-5" />
                Create New Post
              </Link>
            </Button>
          </div>
          
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className={cn(
                isMatrix && "bg-hsl-matrix-dark/50 border border-hsl-matrix-green/30",
                isNsfw && "bg-[hsla(var(--nsfw-dark)/50)] border border-[hsla(var(--nsfw-red)/30)]"
              )}>
                <TabsTrigger 
                  value="trending" 
                  className={cn(
                    "flex items-center",
                    isMatrix && "data-[state=active]:bg-hsl-matrix-dark data-[state=active]:text-hsl-matrix-green data-[state=active]:matrix-glow",
                    isNsfw && "data-[state=active]:bg-[hsla(var(--nsfw-dark)/100)] data-[state=active]:text-[hsla(var(--nsfw-red)/100)] data-[state=active]:nsfw-glow"
                  )}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="latest" 
                  className={cn(
                    "flex items-center",
                    isMatrix && "data-[state=active]:bg-hsl-matrix-dark data-[state=active]:text-hsl-matrix-green data-[state=active]:matrix-glow",
                    isNsfw && "data-[state=active]:bg-[hsla(var(--nsfw-dark)/100)] data-[state=active]:text-[hsla(var(--nsfw-red)/100)] data-[state=active]:nsfw-glow"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Latest
                </TabsTrigger>
              </TabsList>
              
              <Button 
                asChild
                className={cn(
                  "hidden md:flex", // Hide on mobile to reduce redundancy
                  isMatrix && "matrix-button",
                  isNsfw && "nsfw-button"
                )}
              >
                <Link to="/create-post" className="flex items-center">
                  <PenLine className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </div>
            
            <TabsContent value="trending" className="space-y-4">
              <div className="animate-fade-in">
                {isLoadingPosts ? (
                  // Skeleton loading UI
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className={cn(
                      "animate-pulse h-64",
                      isMatrix && "matrix-card bg-hsl-matrix-dark/40",
                      isNsfw && "nsfw-card bg-[hsla(var(--nsfw-dark)/40)]"
                    )} />
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to create a post!</p>
                    {user ? (
                      <Button asChild>
                        <Link to="/create-post">
                          <PenLine className="mr-2 h-4 w-4" />
                          Write the first post
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link to="/login">Sign in to Post</Link>
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="latest" className="space-y-4">
              <div className="animate-fade-in">
                {isLoadingPosts ? (
                  // Skeleton loading UI
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className={cn(
                      "animate-pulse h-64",
                      isMatrix && "matrix-card bg-hsl-matrix-dark/40",
                      isNsfw && "nsfw-card bg-[hsla(var(--nsfw-dark)/40)]"
                    )} />
                  ))
                ) : posts.length > 0 ? (
                  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))
                ) : (
                  <Card className="p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to create a post!</p>
                    {user ? (
                      <Button asChild>
                        <Link to="/create-post">
                          <PenLine className="mr-2 h-4 w-4" />
                          Write the first post
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link to="/login">Sign in to Post</Link>
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6 animate-fade-in">
          <Card className={cn(
            "overflow-hidden",
            isMatrix ? "matrix-card" : isNsfw ? "nsfw-card" : "glass-panel"
          )}>
            <CardHeader className={cn(
              "pb-2",
              isMatrix ? "border-b border-hsl-matrix-green/30" : isNsfw ? "border-b border-[hsla(var(--nsfw-red)/30)]" : "bg-primary/5"
            )}>
              <CardTitle className={cn(
                "flex items-center text-lg",
                isMatrix && "text-hsl-matrix-green",
                isNsfw && "text-[hsla(var(--nsfw-red)/100)]"
              )}>
                <Compass className="mr-2 h-5 w-5" />
                Discover Communities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingCommunities ? (
                // Skeleton loading UI
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-4 animate-pulse">
                    <div className={cn(
                      "h-10 w-10 rounded-full",
                      isMatrix ? "bg-hsl-matrix-dark/70" : isNsfw ? "bg-[hsla(var(--nsfw-dark)/70)]" : "bg-muted"
                    )} />
                    <div className="flex-1 space-y-2">
                      <div className={cn(
                        "h-4 w-2/3 rounded",
                        isMatrix ? "bg-hsl-matrix-dark/70" : isNsfw ? "bg-[hsla(var(--nsfw-dark)/70)]" : "bg-muted"
                      )} />
                      <div className={cn(
                        "h-3 w-full rounded",
                        isMatrix ? "bg-hsl-matrix-dark/70" : isNsfw ? "bg-[hsla(var(--nsfw-dark)/70)]" : "bg-muted"
                      )} />
                    </div>
                  </div>
                ))
              ) : communities.length > 0 ? (
                <div className="space-y-4 stagger-fade-in">
                  {communities.slice(0, 3).map((community) => (
                    <div key={community._id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isMatrix 
                            ? "bg-hsl-matrix-dark border border-hsl-matrix-green/40 text-hsl-matrix-green" 
                            : isNsfw
                              ? "bg-[hsla(var(--nsfw-dark)/100)] border border-[hsla(var(--nsfw-red)/40)] text-[hsla(var(--nsfw-red)/100)]"
                              : "bg-primary/10"
                        )}>
                          <span className={cn(
                            "font-semibold",
                            isMatrix ? "text-hsl-matrix-green" : isNsfw ? "text-[hsla(var(--nsfw-red)/100)]" : "text-primary"
                          )}>
                            {community.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <Link 
                            to={`/community/${community._id}`} 
                            className={cn(
                              "font-medium transition-colors",
                              isMatrix 
                                ? "text-hsl-matrix-green hover:matrix-glow" 
                                : isNsfw
                                  ? "text-[hsla(var(--nsfw-red)/100)] hover:nsfw-glow"
                                  : "hover:text-primary"
                            )}
                          >
                            {community.name}
                          </Link>
                          <p className={cn(
                            "text-xs",
                            isMatrix ? "text-hsl-matrix-green/70" : isNsfw ? "text-[hsla(var(--nsfw-red)/70)]" : "text-muted-foreground"
                          )}>
                            {community.memberCount.toLocaleString()} members
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={isMatrix || isNsfw ? "outline" : "outline"}
                        size="sm"
                        onClick={() => 
                          joinedCommunities.includes(community._id)
                            ? handleLeaveCommunity(community._id)
                            : handleJoinCommunity(community._id)
                        }
                        className={cn(
                          "text-xs py-0 h-7",
                          isMatrix && "matrix-button",
                          isNsfw && "nsfw-button"
                        )}
                      >
                        {joinedCommunities.includes(community._id) ? "Joined" : "Join"}
                      </Button>
                    </div>
                  ))}
                  
                  <Separator className={cn(
                    isMatrix ? "bg-hsl-matrix-green/30" : isNsfw ? "bg-[hsla(var(--nsfw-red)/30)]" : ""
                  )} />
                  
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full",
                      isMatrix && "matrix-button",
                      isNsfw && "nsfw-button"
                    )} 
                    asChild
                  >
                    <Link to="/communities" className="flex items-center justify-center">
                      View All Communities
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">No communities found</p>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full",
                      isMatrix && "matrix-button",
                      isNsfw && "nsfw-button"
                    )} 
                    asChild
                  >
                    <Link to="/create-community">Create Community</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {user && (
            <Card className={cn(
              "overflow-hidden",
              isMatrix ? "matrix-card" : isNsfw ? "nsfw-card" : "glass-panel"
            )}>
              <CardHeader className={cn(
                "pb-2",
                isMatrix ? "border-b border-hsl-matrix-green/30" : isNsfw ? "border-b border-[hsla(var(--nsfw-red)/30)]" : "bg-primary/5"
              )}>
                <CardTitle className={cn(
                  "text-lg",
                  isMatrix && "text-hsl-matrix-green",
                  isNsfw && "text-[hsla(var(--nsfw-red)/100)]"
                )}>
                  Create Content
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Button 
                    asChild 
                    className={cn(
                      "w-full",
                      isMatrix && "matrix-button",
                      isNsfw && "nsfw-button"
                    )}
                  >
                    <Link to="/create-post" className="flex items-center justify-center">
                      <PenLine className="mr-2 h-4 w-4" />
                      New Post
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild 
                    className={cn(
                      "w-full",
                      isMatrix && "matrix-button",
                      isNsfw && "nsfw-button"
                    )}
                  >
                    <Link to="/create-community" className="flex items-center justify-center">
                      <FolderPlus className="mr-2 h-4 w-4" />
                      New Community
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild 
                    className={cn(
                      "w-full",
                      isMatrix && "matrix-button",
                      isNsfw && "nsfw-button"
                    )}
                  >
                    <Link to="/create-discussion" className="flex items-center justify-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      New Discussion
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
