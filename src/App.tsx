import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { SocketProvider } from "@/lib/socket";
import { useState, useEffect, createContext, useContext } from "react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Post from "./pages/Post";
import EditPost from "./pages/EditPost";
import Community from "./pages/Community";
import Communities from "./pages/Communities";
import CreatePost from "./pages/CreatePost";
import CreateCommunity from "./pages/CreateCommunity";
import Discussions from "./pages/Discussions";
import CreateDiscussion from "./pages/CreateDiscussion";
import Discussion from "./pages/Discussion";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// Import Debug only in development mode
const Debug = import.meta.env.DEV ? import("./pages/Debug").then(mod => mod.default) : null;

// Define theme context and provider
type Theme = "light" | "dark" | "matrix" | "nsfw";
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "theme-matrix", "theme-nsfw");
    
    // Add the current theme class
    if (theme === "matrix") {
      root.classList.add("theme-matrix");
    } else if (theme === "nsfw") {
      root.classList.add("theme-nsfw");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Animate page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

const App = () => {
  const [DebugComponent, setDebugComponent] = useState<React.ComponentType | null>(null);
  
  // Lazily load Debug component only in development mode
  useEffect(() => {
    if (import.meta.env.DEV && Debug) {
      Debug.then(Component => {
        setDebugComponent(() => Component);
      });
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <PageTransition>
                        <Home />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/login" 
                    element={
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PageTransition>
                        <Register />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/post/:postId" 
                    element={
                      <PageTransition>
                        <Post />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/edit-post/:postId" 
                    element={
                      <PageTransition>
                        <EditPost />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/community/:slug" 
                    element={
                      <PageTransition>
                        <Community />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/communities" 
                    element={
                      <PageTransition>
                        <Communities />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/create-post" 
                    element={
                      <PageTransition>
                        <CreatePost />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/create-community" 
                    element={
                      <PageTransition>
                        <CreateCommunity />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/discussions" 
                    element={
                      <PageTransition>
                        <Discussions />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/create-discussion" 
                    element={
                      <PageTransition>
                        <CreateDiscussion />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/discussion/:discussionId" 
                    element={
                      <PageTransition>
                        <Discussion />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <PageTransition>
                        <Settings />
                      </PageTransition>
                    } 
                  />
                  {/* Debug route only in development mode */}
                  {import.meta.env.DEV && DebugComponent && (
                    <Route 
                      path="/debug" 
                      element={
                        <PageTransition>
                          {React.createElement(DebugComponent)}
                        </PageTransition>
                      } 
                    />
                  )}
                  <Route 
                    path="*" 
                    element={
                      <PageTransition>
                        <NotFound />
                      </PageTransition>
                    } 
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
