import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth';
import { API_URL } from './axios';

// Interface for our chat message
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  timestamp: Date;
}

// Socket context interface
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinDiscussion: (discussionId: string) => void;
  leaveDiscussion: (discussionId: string) => void;
  sendMessage: (discussionId: string, content: string) => void;
  sendTypingIndicator: (discussionId: string) => void;
  sendStopTypingIndicator: (discussionId: string) => void;
}

// Create context with default values
export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinDiscussion: () => {},
  leaveDiscussion: () => {},
  sendMessage: () => {},
  sendTypingIndicator: () => {},
  sendStopTypingIndicator: () => {}
});

type SocketProviderProps = {
  children: React.ReactNode;
};

// Create provider component
export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      // If not authenticated, disconnect the socket if it exists
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection with auth token
    const newSocket = io(API_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'] // Try both transport methods
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('SocketProvider: Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('SocketProvider: Socket error:', error);
    });

    // Force connect
    newSocket.connect();
    
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Join a discussion room
  const joinDiscussion = (discussionId: string) => {
    if (socket && isConnected) {
      socket.emit('joinDiscussion', discussionId);
    } else {
      console.warn(`SocketProvider: Cannot join discussion ${discussionId}, socket not connected`);
    }
  };

  // Leave a discussion room
  const leaveDiscussion = (discussionId: string) => {
    if (socket && isConnected) {
      socket.emit('leaveDiscussion', discussionId);
    } else {
      console.warn(`SocketProvider: Cannot leave discussion ${discussionId}, socket not connected`);
    }
  };

  // Send a message to a discussion room
  const sendMessage = (discussionId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { discussionId, content });
    } else {
      console.warn(`SocketProvider: Cannot send message to ${discussionId}, socket not connected`);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (discussionId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', discussionId);
    }
  };

  // Send stop typing indicator
  const sendStopTypingIndicator = (discussionId: string) => {
    if (socket && isConnected) {
      socket.emit('stopTyping', discussionId);
    }
  };

  const contextValue = {
    socket,
    isConnected,
    joinDiscussion,
    leaveDiscussion,
    sendMessage,
    sendTypingIndicator,
    sendStopTypingIndicator
  };

  return React.createElement(
    SocketContext.Provider,
    { value: contextValue },
    children
  );
}

// Create custom hook for using the socket context
export const useSocket = () => useContext(SocketContext); 