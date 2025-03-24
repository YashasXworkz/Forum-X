
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Compass, TrendingUp, Clock, User, Plus } from "lucide-react";
import { PostCard } from "@/components/post/PostCard";
import { CommunityCard } from "@/components/community/CommunityCard";
import { useAuth } from "@/lib/auth";
import { useTrendingPosts, usePopularCommunities } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const { data: trendingPosts = [], isLoading: isLoadingPosts } = useTrendingPosts();
  const { data: popularCommunities = [], isLoading: isLoadingCommunities } = usePopularCommunities();
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  
  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities((prev) => [...prev, communityId]);
    toast({
      title: "Joined community",
      description: "You have successfully joined this community",
    });
  };
  
  const handleLeaveCommunity = (communityId: string) => {
    setJoinedCommunities((prev) => prev.filter(id => id !== communityId));
    toast({
      title: "Left community",
      description: "You have left this community",
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="trending" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="latest" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Latest
                </TabsTrigger>
                {user && (
                  <TabsTrigger value="for-you" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    For You
                  </TabsTrigger>
                )}
              </TabsList>
              
              <Button asChild>
                <Link to="/create-post" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </div>
            
            <TabsContent value="trending" className="space-y-4 animate-fade-in">
              {isLoadingPosts ? (
                // Skeleton loading UI
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse h-64" />
                ))
              ) : (
                trendingPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="latest" className="space-y-4 animate-fade-in">
              {/* Would normally fetch latest posts from API */}
              <div className="py-12 text-center text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Latest Posts Coming Soon</h3>
                <p>We're working on bringing you the freshest content.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="for-you" className="space-y-4 animate-fade-in">
              {user ? (
                <div className="py-12 text-center text-muted-foreground">
                  <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Personalized Feed Coming Soon</h3>
                  <p>Join communities to start building your personalized feed.</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="mb-4">You need to be logged in to see your personalized feed.</p>
                    <Button asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="flex items-center text-lg">
                <Compass className="mr-2 h-5 w-5" />
                Discover Communities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingCommunities ? (
                // Skeleton loading UI
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  {popularCommunities.slice(0, 3).map((community: any) => (
                    <div key={community.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {community.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <Link to={`/community/${community.slug}`} className="font-medium hover:text-primary transition-colors">
                            {community.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {community.memberCount.toLocaleString()} members
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          joinedCommunities.includes(community.id)
                            ? handleLeaveCommunity(community.id)
                            : handleJoinCommunity(community.id)
                        }
                      >
                        {joinedCommunities.includes(community.id) ? "Joined" : "Join"}
                      </Button>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/communities" className="flex items-center justify-center">
                      <Compass className="mr-2 h-4 w-4" />
                      View All Communities
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {user && (
            <Card className="glass-panel overflow-hidden">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg">Create Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/create-post" className="flex items-center justify-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/create-community" className="flex items-center justify-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Community
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/create-discussion" className="flex items-center justify-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Start Discussion
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
