import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { MessageSquare, Plus, Clock, Users, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import api from "@/lib/axios";

// API base URL
const API_URL = "http://localhost:5000";

interface Discussion {
  _id: string;
  title: string;
  host: {
    _id: string;
    username: string;
  };
  communityName: string;
  participantCount: number;
  status: string;
  isPrivate: boolean;
  startTime: string;
  participants: string[];
}

const Discussions = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userDiscussions, setUserDiscussions] = useState<Discussion[]>([]);
  
  // Fetch discussions from API
  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true);
      try {
        // Use the configured API instance which already has auth headers set up
        const response = await api.get('/api/discussions');
        
        // Check if the response follows { success: true, data: [...] } format
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setDiscussions(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Direct array response
          setDiscussions(response.data);
        } else {
          console.error("Unexpected discussions data format:", response.data);
          toast({
            title: "Data format error",
            description: "Received unexpected data format from server.",
            variant: "destructive",
          });
          setDiscussions([]);
        }
      } catch (error) {
        console.error("Failed to fetch discussions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch discussions. Please try again.",
          variant: "destructive",
        });
        setDiscussions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDiscussions();
  }, [toast]);
  
  // Fetch user's discussions if logged in
  useEffect(() => {
    if (user && token) {
      const fetchUserDiscussions = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
          // Use the configured API instance which already has auth headers
          const response = await api.get('/api/discussions/user');
          
          // Check if the response follows { success: true, data: [...] } format
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            setUserDiscussions(response.data.data);
          } else if (Array.isArray(response.data)) {
            // Direct array response
            setUserDiscussions(response.data);
          } else {
            console.error("Unexpected user discussions data format:", response.data);
            toast({
              title: "Data format error",
              description: "Received unexpected data format from server.",
              variant: "destructive",
            });
            setUserDiscussions([]);
          }
        } catch (error) {
          console.error("Failed to fetch user discussions:", error);
          toast({
            title: "Error",
            description: "Failed to fetch your discussions. Please try again.",
            variant: "destructive",
          });
          setUserDiscussions([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserDiscussions();
    }
  }, [user, token, toast]);
  
  // Group discussions by status
  const groupDiscussionsByStatus = () => {
    // Ensure discussions is an array
    const discussionsArray = Array.isArray(discussions) ? discussions : [];
    
    return {
      active: discussionsArray.filter(d => d.status === 'active'),
      scheduled: discussionsArray.filter(d => d.status === 'scheduled'),
    };
  };
  
  const { active, scheduled } = groupDiscussionsByStatus();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Group Discussions</h1>
            <p className="text-muted-foreground mt-1">
              Join live audio conversations with other community members
            </p>
          </div>
          
          {user && (
            <Button asChild className="sm:self-end">
              <Link to="/create-discussion" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Start Discussion
              </Link>
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Scheduled ({scheduled.length})
            </TabsTrigger>
            {user && (
              <TabsTrigger value="your" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Your Discussions
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.length > 0 ? (
                  active.map(discussion => (
                    <DiscussionCard key={discussion._id} discussion={discussion} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                      icon={MessageSquare}
                      title="No active discussions"
                      description="There are no active discussions at the moment."
                      actionLink="/create-discussion"
                      actionLabel="Start a Discussion"
                      showAction={!!user}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduled.length > 0 ? (
                  scheduled.map(discussion => (
                    <DiscussionCard key={discussion._id} discussion={discussion} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                      icon={Clock}
                      title="No scheduled discussions"
                      description="There are no upcoming discussions scheduled."
                      actionLink="/create-discussion"
                      actionLabel="Schedule a Discussion"
                      showAction={!!user}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="your" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(Array.isArray(userDiscussions) && userDiscussions.length > 0) ? (
                    userDiscussions.map(discussion => (
                      <DiscussionCard key={discussion._id} discussion={discussion} isOwner={discussion.host._id === user._id} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState 
                        icon={Users}
                        title="No discussions yet"
                        description="You haven't created or participated in any discussions yet."
                        actionLink="/create-discussion"
                        actionLabel="Start Your First Discussion"
                        showAction={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

interface DiscussionCardProps {
  discussion: Discussion;
  isOwner?: boolean;
}

const DiscussionCard = ({ discussion, isOwner = false }: DiscussionCardProps) => {
  const startDate = new Date(discussion.startTime);
  const isLive = discussion.status === "active";
  const isPast = startDate < new Date();
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };
  
  const getStatusLabel = () => {
    if (isLive) return "LIVE NOW";
    if (isPast) return "ENDED";
    
    // Format relative time
    const timeUntilStart = startDate.getTime() - Date.now();
    const minutesUntil = Math.floor(timeUntilStart / (1000 * 60));
    const hoursUntil = Math.floor(minutesUntil / 60);
    
    if (hoursUntil > 0) {
      return `Starts in ${hoursUntil}h`;
    } else if (minutesUntil > 0) {
      return `Starts in ${minutesUntil}m`;
    } else {
      return "Starting soon";
    }
  };
  
  const handleJoinDiscussion = async () => {
    // Navigate to the discussion detail page
    window.location.href = `/discussion/${discussion._id}`;
  };
  
  return (
    <Card className={`glass-panel overflow-hidden transition-all duration-300 ${isLive ? 'border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}>
      <div className={`h-2 ${isLive ? 'bg-primary animate-pulse-subtle' : 'bg-muted'}`}></div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{discussion.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hosted by <span className="font-medium">{discussion.host.username}</span> in r/{discussion.communityName}
            </p>
          </div>
          
          {discussion.isPrivate && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{discussion.participantCount} participants</span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isLive 
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {getStatusLabel()}
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            className="w-full"
            variant={isLive ? "default" : "outline"}
            onClick={handleJoinDiscussion}
          >
            {isLive 
              ? "Join Now" 
              : isOwner 
                ? "Manage Discussion" 
                : "View Details"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Discussions;
