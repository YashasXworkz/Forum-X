
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Share, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface CommunityHeaderProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
    memberCount: number;
    imageUrl?: string;
    createdAt: string;
  };
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  const [isMember, setIsMember] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  
  const handleToggleMembership = () => {
    const newMemberState = !isMember;
    setIsMember(newMemberState);
    
    toast({
      title: newMemberState 
        ? `Joined r/${community.name}`
        : `Left r/${community.name}`,
      description: newMemberState
        ? "You will now see posts from this community"
        : "You will no longer see posts from this community",
    });
    
    // If leaving the community, also disable notifications
    if (!newMemberState && isNotificationEnabled) {
      setIsNotificationEnabled(false);
    }
  };
  
  const handleToggleNotifications = () => {
    // Only allow notification toggle if member
    if (!isMember) {
      toast({
        title: "Join required",
        description: "You need to join this community to enable notifications",
      });
      return;
    }
    
    const newNotificationState = !isNotificationEnabled;
    setIsNotificationEnabled(newNotificationState);
    
    toast({
      title: newNotificationState
        ? "Notifications enabled"
        : "Notifications disabled",
      description: newNotificationState
        ? `You will receive notifications from r/${community.name}`
        : `You will no longer receive notifications from r/${community.name}`,
    });
  };
  
  const handleShare = () => {
    // In a real app, would use navigator.share or copy to clipboard
    toast({
      title: "Link copied!",
      description: "Community link copied to clipboard",
    });
  };

  return (
    <div className="bg-card shadow-sm rounded-lg overflow-hidden animate-fade-in">
      <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/5"></div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20 mb-4 sm:mb-6 gap-4">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-md">
            <AvatarFallback className="text-3xl font-semibold bg-primary text-primary-foreground">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
            {community.imageUrl && (
              <AvatarImage src={community.imageUrl} alt={community.name} />
            )}
          </Avatar>
          
          <div className="flex-1 mt-2 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{community.name}</h1>
            <p className="text-muted-foreground mt-1">
              r/{community.slug} • {community.memberCount.toLocaleString()} members • Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Button
              variant={isMember ? "outline" : "default"}
              onClick={handleToggleMembership}
              className="w-full sm:w-auto"
            >
              {isMember ? "Joined" : "Join"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleNotifications}
              disabled={!isMember}
              className={isNotificationEnabled ? "text-primary" : ""}
            >
              {isNotificationEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isNotificationEnabled ? "Disable notifications" : "Enable notifications"}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              asChild
            >
              <a href="#about">
                <Info className="h-4 w-4" />
                <span className="sr-only">About</span>
              </a>
            </Button>
          </div>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{community.description}</p>
        </div>
      </div>
    </div>
  );
};
