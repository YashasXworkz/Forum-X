import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityCard } from "@/components/community/CommunityCard";
import { Layout } from "@/components/layout/Layout";
import { Search, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { EmptyState } from "@/components/ui/empty-state";

// API base URL
const API_URL = "http://localhost:5000";

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

const Communities = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/communities`);
        setCommunities(response.data.data);
      } catch (error: any) {
        toast({
          title: "Error fetching communities",
          description: error.response?.data?.error || "Failed to load communities. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunities();
  }, [toast]);
  
  // Fetch joined communities if user is logged in
  useEffect(() => {
    if (user && token) {
      // In a real implementation, you would fetch user's communities from the API
      // For now, we'll keep track of joined communities client-side
    }
  }, [user, token]);
  
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
      
      toast({
        title: "Joined community",
        description: "You have successfully joined this community",
      });
    } catch (error: any) {
      toast({
        title: "Failed to join community",
        description: error.response?.data?.error || "An error occurred while joining the community. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLeaveCommunity = async (communityId: string) => {
    if (!user || !token) {
      return;
    }
    
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
      
      toast({
        title: "Left community",
        description: "You have left this community",
      });
    } catch (error: any) {
      toast({
        title: "Failed to leave community",
        description: error.response?.data?.error || "An error occurred while leaving the community. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter communities based on search query
  const filteredCommunities = searchQuery
    ? communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communities;
    
  // Get communities the user has joined
  const userJoinedCommunities = communities.filter(
    community => joinedCommunities.includes(community._id)
  );

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
                {filteredCommunities.map(community => (
                  <CommunityCard
                    key={community._id}
                    community={community}
                    isMember={joinedCommunities.includes(community._id)}
                    onJoin={() => handleJoinCommunity(community._id)}
                    onLeave={() => handleLeaveCommunity(community._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No communities found"
                description="No communities matching your search were found."
                showAction={false}
              />
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="joined" className="mt-6">
              {userJoinedCommunities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userJoinedCommunities.map(community => (
                    <CommunityCard
                      key={community._id}
                      community={community}
                      isMember={true}
                      onLeave={() => handleLeaveCommunity(community._id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No joined communities"
                  description="You haven't joined any communities yet."
                  actionLink="#all"
                  actionLabel="Browse Communities"
                />
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Communities;
