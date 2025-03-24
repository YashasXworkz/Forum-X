
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, Sidebar as SidebarContainer, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Search, Compass, Users, MessageSquare, Bookmark, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePopularCommunities } from "@/lib/api";

export const AppSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: popularCommunities = [] } = usePopularCommunities();

  const mainNavItems = [
    {
      title: "Home",
      icon: Home,
      href: "/",
    },
    {
      title: "Explore",
      icon: Compass,
      href: "/explore",
    },
    {
      title: "Communities",
      icon: Users,
      href: "/communities",
    },
    {
      title: "Discussions",
      icon: MessageSquare,
      href: "/discussions",
    },
    {
      title: "Saved",
      icon: Bookmark,
      href: "/saved",
    },
  ];

  const createCommunity = () => {
    if (user) {
      navigate("/create-community");
    } else {
      navigate("/login");
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold">ForumX</h2>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <Separator className="my-4" />
          
          <SidebarGroup>
            <div className="flex items-center justify-between px-4">
              <SidebarGroupLabel>Popular Communities</SidebarGroupLabel>
              <Button variant="ghost" size="icon" onClick={createCommunity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {popularCommunities.map((community: any) => (
                  <SidebarMenuItem key={community.id}>
                    <SidebarMenuButton asChild>
                      <Link to={`/community/${community.slug}`} className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mr-2">
                          {community.name.charAt(0)}
                        </div>
                        <span>{community.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter className="border-t pt-2">
        <div className="px-4 py-2">
          {user ? (
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user.username}</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
};
