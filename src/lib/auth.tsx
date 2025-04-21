import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import api, { API_URL } from "./axios";

interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Check for saved user and token on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await api.post(`/api/users/login`, {
        email,
        password
      });
      
      const { data, token: authToken } = response.data;
      
      setUser(data);
      setToken(authToken);
      
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", authToken);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.username}!`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "An unknown error occurred";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Test the server connection first
      try {
        await api.get('/health');
      } catch (connErr) {
        console.error('Server connection test failed:', connErr);
        throw new Error(`Cannot connect to server at ${API_URL}. Please ensure the backend is running.`);
      }
      
      // Proceed with registration
      const response = await api.post(`/api/users/register`, {
        username,
        email,
        password
      });
      
      const { data, token: authToken } = response.data;
      
      setUser(data);
      setToken(authToken);
      
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", authToken);
      
      toast({
        title: "Registration successful",
        description: `Welcome to ForumX, ${username}!`,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "An unknown error occurred";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
        errorMessage = `Network error: No response from server at ${API_URL}. Please check your internet connection and that the server is running on port 5000.`;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
