import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, Plus, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toggleSidebar } = useSidebar();

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-colors duration-300",
      isMatrix 
        ? "border-hsl-matrix-green/30 bg-hsl-matrix-dark/95" 
        : "border-border/40 bg-background/95"
    )}>
      <div className="container px-4 md:px-6 flex h-14 items-center">
        <div className="flex items-center gap-2 md:gap-4 mr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={cn(
              "md:hidden",
              isMatrix && "text-hsl-matrix-green hover:text-hsl-matrix-green/80"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div 
              className={cn(
                "text-2xl font-bold animate-pulse-subtle",
                isMatrix 
                  ? "text-hsl-matrix-green matrix-glow" 
                  : "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              )}
            >
              ForumX
            </div>
          </Link>
        </div>

        <div className={cn(
          "relative transition-all duration-300 flex-1 max-w-3xl mx-auto",
          isSearchFocused ? "scale-105" : ""
        )}>
          <Search className={cn(
            "absolute left-2.5 top-2.5 h-4 w-4",
            isMatrix ? "text-hsl-matrix-green/70" : "text-muted-foreground"
          )} />
          <Input
            type="search"
            placeholder="Search communities, posts, or users..."
            className={cn(
              "pl-8 pr-4 w-full transition-all duration-300",
              isMatrix 
                ? "matrix-input bg-hsl-matrix-dark/50" 
                : "bg-secondary"
            )}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 ml-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-9 w-9",
                  isMatrix 
                    ? "text-hsl-matrix-green hover:bg-hsl-matrix-dark/80 hover:border-hsl-matrix-green/50 hover:matrix-glow" 
                    : "hover:bg-accent"
                )}
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-9 w-9",
                  isMatrix 
                    ? "text-hsl-matrix-green hover:bg-hsl-matrix-dark/80 hover:border-hsl-matrix-green/50 hover:matrix-glow" 
                    : "hover:bg-accent"
                )} 
                asChild
              >
                <Link to="/create-post">
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Create</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "relative h-9 w-9 rounded-full transition-all duration-300", 
                      isMatrix && "border border-hsl-matrix-green/50 p-[2px]"
                    )} 
                    size="icon"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback className={isMatrix ? "text-hsl-matrix-green bg-hsl-matrix-dark" : ""}>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.username}`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant={isMatrix ? "outline" : "ghost"} 
                asChild 
                className={cn(
                  "hidden sm:flex",
                  isMatrix && "matrix-button"
                )}
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button 
                asChild
                className={isMatrix ? "matrix-button" : ""}
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
