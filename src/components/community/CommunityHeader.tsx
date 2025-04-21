import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

interface CommunityHeaderProps {
  community: {
    _id: string;
    name: string;
    description: string;
    memberCount: number;
    category: string;
    imageUrl?: string;
    isPrivate: boolean;
    createdAt: string;
  };
  isJoined?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  isJoined = false,
  onJoin,
  onLeave
}) => {
  const { user } = useAuth();
  
  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
        {community.imageUrl ? (
          <img 
            src={community.imageUrl} 
            alt={community.name} 
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <h1 className="text-6xl font-bold text-primary/30">r/{community.name.charAt(0).toUpperCase()}</h1>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between mt-4 gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarFallback className="text-lg">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
            {community.imageUrl && (
              <AvatarImage src={community.imageUrl} alt={community.name} />
            )}
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">r/{community.name}</h1>
              {community.isPrivate && (
                <Badge variant="outline" className="text-xs font-medium">Private</Badge>
              )}
              <Badge>{community.category}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        
        {user && (
          <div className="flex space-x-2 self-start">
            {isJoined ? (
              <Button 
                variant="outline" 
                onClick={onLeave}
              >
                Leave
              </Button>
            ) : (
              <Button 
                onClick={onJoin}
              >
                Join
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
