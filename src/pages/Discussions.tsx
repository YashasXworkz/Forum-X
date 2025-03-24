
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { MessageSquare, Plus, Clock, Users, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Discussions = () => {
  const { user } = useAuth();
  
  // Mock discussion data
  const mockDiscussions = [
    {
      id: "1",
      title: "Photography Techniques Workshop",
      host: "photoexpert",
      communityName: "Photography",
      participantCount: 24,
      status: "active",
      isPrivate: false,
      startTime: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes from now
    },
    {
      id: "2",
      title: "Game Development Q&A",
      host: "devguru",
      communityName: "Gaming",
      participantCount: 42,
      status: "active",
      isPrivate: false,
      startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "3",
      title: "Book Club: Monthly Discussion",
      host: "bookworm",
      communityName: "Books",
      participantCount: 18,
      status: "scheduled",
      isPrivate: true,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
    },
  ];
  
  const groupDiscussionsByStatus = () => {
    return {
      active: mockDiscussions.filter(d => d.status === 'active'),
      scheduled: mockDiscussions.filter(d => d.status === 'scheduled'),
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.length > 0 ? (
                active.map(discussion => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No active discussions</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no active discussions at the moment.
                  </p>
                  {user && (
                    <Button asChild>
                      <Link to="/create-discussion">Start a Discussion</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduled.length > 0 ? (
                scheduled.map(discussion => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No scheduled discussions</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no upcoming discussions scheduled.
                  </p>
                  {user && (
                    <Button asChild>
                      <Link to="/create-discussion">Schedule a Discussion</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {user && (
            <TabsContent value="your" className="mt-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created or participated in any discussions yet.
                </p>
                <Button asChild>
                  <Link to="/create-discussion">Start Your First Discussion</Link>
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    host: string;
    communityName: string;
    participantCount: number;
    status: string;
    isPrivate: boolean;
    startTime: string;
  };
}

const DiscussionCard = ({ discussion }: DiscussionCardProps) => {
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
  
  return (
    <Card className={`glass-panel overflow-hidden transition-all duration-300 ${isLive ? 'border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}>
      <div className={`h-2 ${isLive ? 'bg-primary animate-pulse-subtle' : 'bg-muted'}`}></div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{discussion.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hosted by <span className="font-medium">{discussion.host}</span> in r/{discussion.communityName}
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
            asChild
          >
            <Link to={`/discussion/${discussion.id}`}>
              {isLive ? "Join Now" : "View Details"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Discussions;
