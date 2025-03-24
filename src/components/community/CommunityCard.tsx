
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
    memberCount: number;
    imageUrl?: string;
    createdAt: string;
  };
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export const CommunityCard = ({ 
  community, 
  isMember = false, 
  onJoin, 
  onLeave 
}: CommunityCardProps) => {
  const handleToggleMembership = () => {
    if (isMember) {
      onLeave?.();
    } else {
      onJoin?.();
    }
  };

  return (
    <Card className="glass-panel hover:shadow-glass-hover overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5"></div>
      
      <CardContent className="pt-0">
        <div className="flex justify-between -mt-10">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
            {community.imageUrl && (
              <AvatarImage src={community.imageUrl} alt={community.name} />
            )}
          </Avatar>
          
          <Button
            variant={isMember ? "outline" : "default"}
            className="mt-auto"
            onClick={handleToggleMembership}
          >
            {isMember ? "Joined" : "Join"}
          </Button>
        </div>
        
        <div className="mt-3">
          <Link to={`/community/${community.slug}`}>
            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
              {community.name}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            {community.memberCount.toLocaleString()} members • Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
          </p>
          
          <p className="mt-2 text-sm line-clamp-2">
            {community.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30">
        <Link 
          to={`/community/${community.slug}`}
          className="text-sm text-primary story-link"
        >
          View Community
        </Link>
      </CardFooter>
    </Card>
  );
};
