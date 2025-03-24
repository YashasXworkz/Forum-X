
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Layout } from "@/components/layout/Layout";
import { Search, Plus } from "lucide-react";
import { usePopularCommunities } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Communities = () => {
  const { user } = useAuth();
  const { data: communities = [], isLoading } = usePopularCommunities();
  const [searchQuery, setSearchQuery] = useState("");
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
  
  const filteredCommunities = searchQuery
    ? communities.filter((community: any) => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communities;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Communities</h1>
          
          {user && (
            <Button asChild className="sm:self-end">
              <Link to="/create-community" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Community
              </Link>
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Communities</TabsTrigger>
            {user && (
              <TabsTrigger value="joined">Joined</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community: any) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isMember={joinedCommunities.includes(community.id)}
                    onJoin={() => handleJoinCommunity(community.id)}
                    onLeave={() => handleLeaveCommunity(community.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No communities found matching your search.</p>
              </div>
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="joined" className="mt-6">
              {joinedCommunities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communities
                    .filter((community: any) => joinedCommunities.includes(community.id))
                    .map((community: any) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        isMember={true}
                        onLeave={() => handleLeaveCommunity(community.id)}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't joined any communities yet.</p>
                  <Button asChild>
                    <Link to="#all">Browse Communities</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Communities;
