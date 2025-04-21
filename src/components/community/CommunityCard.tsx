import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface CommunityCardProps {
  community: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    memberCount: number;
    category: string;
    imageUrl?: string;
    isPrivate: boolean;
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
  onLeave,
}: CommunityCardProps) => {
  const { user } = useAuth();
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-24 bg-gradient-to-r from-primary/30 to-primary/10 flex items-center justify-center"
      >
        {community.imageUrl ? (
          <img 
            src={community.imageUrl} 
            alt={community.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-primary/40 text-center px-4">
            {community.name}
          </span>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              to={`/community/${community.slug}`} 
              className="text-lg font-semibold hover:underline"
            >
              r/{community.name}
            </Link>
            
            <div className="flex items-center space-x-1 mt-1 text-muted-foreground text-sm">
              <Users className="h-3.5 w-3.5" />
              <span>{community.memberCount.toLocaleString()} members</span>
              
              {community.isPrivate && (
                <>
                  <span className="mx-1">•</span>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Private</span>
                </>
              )}
            </div>
          </div>
          
          <Badge variant="outline">{community.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {community.description}
        </p>
      </CardContent>
      
      <CardFooter>
        {user ? (
          isMember ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onLeave}
            >
              Leave
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="w-full"
              onClick={onJoin}
            >
              Join
            </Button>
          )
        ) : (
          <Button 
            asChild
            size="sm" 
            className="w-full"
          >
            <Link to="/login">Sign in to Join</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
