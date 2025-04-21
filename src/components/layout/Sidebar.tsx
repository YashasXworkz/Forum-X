import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Users, MessageSquare, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();

  const mainNavItems = [
    {
      title: "Home",
      icon: Home,
      href: "/",
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
  ];

  return (
    <div className={cn(
      "h-screen bg-sidebar transition-all duration-200 border-r z-10",
      isMatrix && "border-hsl-matrix-green/30",
      open ? "w-56" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center justify-between px-4 py-2 transition-colors duration-300",
          isMatrix && "border-b border-hsl-matrix-green/30" 
        )}>
          <div className="flex-1"></div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={cn(
              "p-0",
              isMatrix && "text-hsl-matrix-green hover:text-hsl-matrix-green/80"
            )}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="px-2 py-2">
              {open && (
                <div className={cn(
                  "text-base font-bold text-center mb-3",
                  isMatrix ? "text-hsl-matrix-green/80" : "text-muted-foreground"
                )}>
                  Navigation
                </div>
              )}
              <div className="space-y-1">
                {mainNavItems.map((item, index) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full justify-start font-bold",
                      !open && "justify-center px-0",
                      isMatrix && "hover:matrix-glow hover:text-hsl-matrix-green"
                    )}
                  >
                    <Link to={item.href} className={cn(
                      "flex items-center",
                      !open && "justify-center"
                    )}>
                      <item.icon className={cn(
                        "h-6 w-6",
                        open && "mr-3",
                        isMatrix && "text-hsl-matrix-green/80"
                      )} />
                      {open && (
                        <span className="text-lg font-bold">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <div className={cn(
          "border-t pt-2 px-2 pb-2",
          isMatrix && "border-hsl-matrix-green/30"
        )}>
          <div className="px-2 py-2">
            {user ? (
              <div className={cn(
                "text-sm font-bold",
                isMatrix ? "text-hsl-matrix-green/70" : "text-muted-foreground",
                !open && "hidden"
              )}>
                Logged in as <span className={cn(
                  "font-bold",
                  isMatrix ? "text-hsl-matrix-green matrix-glow" : "text-foreground"
                )}>{user.username}</span>
              </div>
            ) : (
              <div className={cn(
                "flex flex-col space-y-2",
                !open && "hidden"
              )}>
                <Button 
                  asChild 
                  size="sm" 
                  className={cn(
                    "w-full font-bold",
                    isMatrix && "matrix-button"
                  )}
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button 
                  asChild 
                  variant={isMatrix ? "ghost" : "outline"} 
                  size="sm" 
                  className={cn(
                    "w-full font-bold",
                    isMatrix && "matrix-button border border-hsl-matrix-green/30"
                  )}
                >
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
