
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Info, Plus } from "lucide-react";
import { PostCard } from "@/components/post/PostCard";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommunity, useCommunityPosts } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Community = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    data: community, 
    isLoading: isLoadingCommunity,
    error: communityError
  } = useCommunity(slug || "");
  
  const {
    data: posts = [],
    isLoading: isLoadingPosts
  } = useCommunityPosts(community?.id || "");
  
  if (communityError) {
    navigate("/not-found", { replace: true });
    return null;
  }
  
  if (isLoadingCommunity) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-12 w-48 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <CommunityHeader community={community} />
        
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
              
              <Button asChild>
                <Link to={`/create-post?community=${community.id}`} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </div>
            
            <TabsContent value="posts" className="space-y-4">
              {isLoadingPosts ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to create a post in this community!</p>
                    <Button asChild>
                      <Link to={`/create-post?community=${community.id}`}>Create Post</Link>
                    </Button>
                  </CardContent>
                </Card>
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
                      <Link to={`/create-discussion?community=${community.id}`}>Start Discussion</Link>
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
                        <dt className="text-sm text-muted-foreground">Discussions</dt>
                        <dd className="font-medium">0</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          <div className="space-y-6">
            <Card className="glass-panel">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg">Community Rules</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Be respectful and civil</li>
                  <li>No hate speech or harassment</li>
                  <li>No spam or self-promotion</li>
                  <li>Use descriptive titles for posts</li>
                  <li>Properly tag sensitive content</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card className="glass-panel">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg">Moderators</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">A</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">admin_user</p>
                      <p className="text-xs text-muted-foreground">Creator</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">M</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">mod_helper</p>
                      <p className="text-xs text-muted-foreground">Moderator</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Moderators
                  </Button>
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
