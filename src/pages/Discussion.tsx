import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, ArrowLeft, Clock, Send, X, Mic, MicOff, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useSocket, ChatMessage } from "@/lib/socket";
import api, { API_URL } from "@/lib/axios";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoConference from "@/components/discussion/VideoConference";

interface DiscussionDetail {
  _id: string;
  title: string;
  description: string;
  host: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  communityName: string;
  participantCount: number;
  participants: {
    _id: string;
    username: string;
    avatarUrl?: string;
  }[];
  status: string;
  isPrivate: boolean;
  startTime: string;
}

interface UserTyping {
  userId: string;
  username: string;
}

interface DiscussionMessage {
  _id: string;
  discussionId: string;
  sender: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Discussion = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [usersTyping, setUsersTyping] = useState<UserTyping[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "video">("text");
  
  // Get socket context
  const { 
    socket, 
    isConnected,
    joinDiscussion,
    leaveDiscussion,
    sendMessage: sendSocketMessage,
    sendTypingIndicator,
    sendStopTypingIndicator
  } = useSocket();
  
  // Check if user is already a participant
  const isParticipant = discussion?.participants.some(p => user && p._id === user._id);
  // Check if user is the host
  const isHost = discussion?.host._id === user?._id;
  
  // Fetch discussion details
  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/discussions/${discussionId}`);
        setDiscussion(response.data.data);
      } catch (error: any) {
        toast({
          title: "Error fetching discussion",
          description: error.response?.data?.error || "Failed to load discussion details",
          variant: "destructive",
        });
        navigate("/discussions");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (discussionId) {
      fetchDiscussion();
    }
  }, [discussionId, navigate, toast]);
  
  // Fetch messages when chat is opened
  useEffect(() => {
    const fetchMessages = async () => {
      if (!discussionId || !isChatOpen) return;
      
      try {
        setIsLoadingMessages(true);
        const response = await api.get(`/api/discussions/${discussionId}/messages`);
        
        if (response.data.data && Array.isArray(response.data.data)) {
          // Convert API message format to ChatMessage format
          const formattedMessages = response.data.data.map((msg: DiscussionMessage) => ({
            id: msg._id,
            userId: msg.sender,
            username: msg.senderUsername,
            content: msg.content,
            timestamp: new Date(msg.createdAt)
          }));
          
          // Add welcome message at the beginning
          const welcomeMessage = {
            id: 'welcome',
            userId: 'system',
            username: 'System',
            content: `Welcome to the discussion on ${discussion?.title}! Be respectful of others.`,
            timestamp: new Date()
          };
          
          // Sort messages by timestamp (oldest first)
          const sortedMessages = [...formattedMessages].sort((a, b) => 
            a.timestamp.getTime() - b.timestamp.getTime()
          );
          
          setMessages([welcomeMessage, ...sortedMessages]);
          
          console.log(`Loaded ${formattedMessages.length} messages from the server`);
        }
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error loading messages",
          description: "Failed to load previous messages. You can still send new ones.",
          variant: "destructive",
        });
        
        // Set just the welcome message
        setMessages([{
          id: 'welcome',
          userId: 'system',
          username: 'System',
          content: `Welcome to the discussion on ${discussion?.title}! Be respectful of others.`,
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [discussionId, isChatOpen, discussion?.title, toast]);
  
  // Join discussion
  const handleJoinDiscussion = async () => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to join a discussion",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsJoining(true);
      
      await api.post(`/api/discussions/${discussionId}/join`, {});
      
      // Reload discussion to update participant list
      const response = await api.get(`/api/discussions/${discussionId}`);
      setDiscussion(response.data.data);
      
      toast({
        title: "Joined successfully",
        description: "You have joined the discussion",
      });
      
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error.response?.data?.error || "An error occurred while joining the discussion. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Leave discussion
  const handleLeaveDiscussion = async () => {
    try {
      await api.post(`/api/discussions/${discussionId}/leave`, {});
      
      // Reload discussion to update participant list
      const response = await api.get(`/api/discussions/${discussionId}`);
      setDiscussion(response.data.data);
      
      toast({
        title: "Left discussion",
        description: "You have left the discussion",
      });
    } catch (error: any) {
      toast({
        title: "Failed to leave",
        description: error.response?.data?.error || "An error occurred while leaving the discussion. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Connect to socket room when chat is opened
  useEffect(() => {
    if (isChatOpen && discussionId) {
      // Only attempt to join if socket is connected
      if (isConnected) {
        console.log("Discussion: Joining discussion room", discussionId);
        // Join the discussion room
        joinDiscussion(discussionId);
        
        // We don't need to add a welcome message here anymore since we load messages from the API
      } else {
        console.log("Discussion: Socket not connected, cannot join room");
      }
      
      // Cleanup: leave the room when component unmounts or chat is closed
      return () => {
        if (isConnected) {
          console.log("Discussion: Leaving discussion room", discussionId);
          leaveDiscussion(discussionId);
        }
      };
    }
  }, [isChatOpen, discussionId, isConnected, joinDiscussion, leaveDiscussion]);
  
  // Listen for socket events
  useEffect(() => {
    if (!socket || !isChatOpen) return;
    
    // Handle incoming messages
    const handleNewMessage = (message: ChatMessage) => {
      // If the message is from the current user, mark as sent
      if (message.userId === user?._id) {
        setIsSending(false);
      }
      
      // Add the message to the chat if it's not already there
      setMessages(prev => {
        // Check if we already have this message (by id)
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          return prev;
        }
        
        // Add as new message
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }];
      });
      
      // Remove the user from typing list
      setUsersTyping(prev => prev.filter(u => u.userId !== message.userId));
    };
    
    // Handle user joined notification
    const handleUserJoined = (data: { userId: string; username: string }) => {
      // Don't show notification for current user
      if (data.userId === user?._id) return;
      
      // Add system message that user has joined
      setMessages(prev => [...prev, {
        id: `join-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `${data.username} has joined the discussion.`,
        timestamp: new Date()
      }]);
    };
    
    // Handle user left notification
    const handleUserLeft = (data: { userId: string; username: string }) => {
      // Don't show notification for current user
      if (data.userId === user?._id) return;
      
      // Add system message that user has left
      setMessages(prev => [...prev, {
        id: `leave-${Date.now()}`,
        userId: 'system',
        username: 'System',
        content: `${data.username} has left the discussion.`,
        timestamp: new Date()
      }]);
      
      // Remove user from typing list
      setUsersTyping(prev => prev.filter(u => u.userId !== data.userId));
    };
    
    // Handle typing indicators
    const handleUserTyping = (data: UserTyping) => {
      // Don't show typing for current user
      if (data.userId === user?._id) return;
      
      // Add user to typing list if not already there
      setUsersTyping(prev => {
        if (!prev.some(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
      
      // Remove user from typing after a timeout
      setTimeout(() => {
        setUsersTyping(prev => prev.filter(u => u.userId !== data.userId));
      }, 3000);
    };
    
    // Handle user stopped typing
    const handleUserStoppedTyping = (data: { userId: string }) => {
      // Remove user from typing list
      setUsersTyping(prev => prev.filter(u => u.userId !== data.userId));
    };
    
    // Register socket event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    
    // Cleanup function to remove event listeners
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [socket, isChatOpen, user?._id]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    
    setIsSending(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      // Notify that we stopped typing
      sendStopTypingIndicator(discussionId || '');
    }
    
    // Send message through socket
    sendSocketMessage(discussionId || '', newMessage.trim());
    
    // Clear the input
    setNewMessage('');
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!discussionId) return;
    
    // Send typing indicator
    sendTypingIndicator(discussionId);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingIndicator(discussionId);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle changing new message text
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };
  
  // Handle reconnection
  const handleManualReconnect = () => {
    if (socket) {
      console.log("Discussion: Attempting manual reconnection");
      // Disconnect and reconnect - this will trigger the useEffect in the socket provider
      socket.disconnect();
      socket.connect();
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!discussion) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Discussion not found</h3>
            <p className="text-muted-foreground mb-4">
              The discussion you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/discussions">Back to Discussions</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isLive = discussion.status === "active";
  const isPast = new Date(discussion.startTime) < new Date() && !isLive;
  const startDate = new Date(discussion.startTime);
  
  if (isChatOpen && discussion) {
    return (
      <Layout>
        <div className="container py-8 animate-fade-in h-[calc(100vh-180px)] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="mr-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h2 className="text-xl font-bold">{discussion.title}</h2>
              {isLive && (
                <span className="ml-3 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{discussion.participantCount} participants</span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "text" | "video")} className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="text" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center">
                <Video className="mr-2 h-4 w-4" />
                Video Conference
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
              <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.userId === 'system' ? 'justify-center' : 'items-start'}`}>
                        {message.userId !== 'system' && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {message.username[0].toUpperCase()}
                            </AvatarFallback>
                            {message.avatarUrl && (
                              <AvatarImage src={message.avatarUrl} />
                            )}
                          </Avatar>
                        )}
                        
                        <div className={`${message.userId === 'system' ? 'px-3 py-1.5 bg-muted text-muted-foreground text-xs rounded-md' : 'flex-1'}`}>
                          {message.userId !== 'system' && (
                            <div className="flex items-baseline mb-1">
                              <span className="font-medium text-sm">
                                {message.username}
                                {message.userId === user?._id && ' (You)'}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {format(message.timestamp, 'h:mm a')}
                              </span>
                            </div>
                          )}
                          <p className={message.userId === 'system' ? '' : 'text-sm'}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicators */}
                    {usersTyping.length > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground animate-pulse">
                        <div className="flex -space-x-2 mr-2">
                          {usersTyping.slice(0, 3).map(user => (
                            <Avatar key={user.userId} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-[10px]">
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span>
                          {usersTyping.length === 1
                            ? `${usersTyping[0].username} is typing...`
                            : `${usersTyping.length} people are typing...`}
                        </span>
                      </div>
                    )}
                    
                    {/* Auto-scroll anchor */}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-3 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleMessageChange}
                      onKeyDown={handleKeyPress}
                      disabled={isSending || !isConnected}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={isSending || !newMessage.trim() || !isConnected}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  
                  {!isConnected && (
                    <div className="mt-2 flex items-center justify-center">
                      <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-md text-xs flex items-center">
                        <span className="mr-1 bg-yellow-500 rounded-full h-2 w-2"></span>
                        Connecting to chat...
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs ml-2 p-0 h-auto"
                          onClick={handleManualReconnect}
                        >
                          Reconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="video" className="flex-1 data-[state=inactive]:hidden">
              <VideoConference 
                discussionId={discussionId || ''} 
                onBack={() => setIsChatOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/discussions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discussions
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <div className={`h-2 ${isLive ? 'bg-primary animate-pulse-subtle' : 'bg-muted'}`}></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{discussion.title}</CardTitle>
                    <CardDescription>
                      In r/{discussion.communityName}
                    </CardDescription>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isLive 
                      ? 'bg-primary/10 text-primary'
                      : isPast
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isLive 
                      ? "LIVE NOW" 
                      : isPast
                        ? "ENDED"
                        : `Starts on ${format(startDate, "MMM d, h:mm a")}`
                    }
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={discussion.host.avatarUrl} />
                    <AvatarFallback>{discussion.host.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Hosted by {discussion.host.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {discussion.isPrivate ? "Private discussion" : "Public discussion"}
                    </p>
                  </div>
                </div>
                
                {discussion.description && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">About this discussion</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {discussion.description}
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  {isLive ? (
                    isParticipant || isHost ? (
                      <div className="space-y-4">
                        <Button className="w-full" onClick={() => setIsChatOpen(true)}>
                          Enter Discussion Room
                        </Button>
                        
                        {!isHost && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleLeaveDiscussion}
                          >
                            Leave Discussion
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleJoinDiscussion}
                        disabled={isJoining}
                      >
                        {isJoining ? "Joining..." : "Join Discussion"}
                      </Button>
                    )
                  ) : isPast ? (
                    <Button variant="outline" className="w-full" disabled>
                      Discussion has ended
                    </Button>
                  ) : isHost ? (
                    <Button className="w-full">
                      Manage Discussion
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleJoinDiscussion}
                      disabled={isJoining}
                      className="w-full"
                    >
                      {isJoining ? "Joining..." : "Join Discussion"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Participants ({discussion.participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Host */}
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={discussion.host.avatarUrl} />
                      <AvatarFallback>{discussion.host.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{discussion.host.username}</p>
                      <p className="text-xs text-muted-foreground">Host</p>
                    </div>
                  </div>
                  
                  {/* Other participants */}
                  {discussion.participants
                    .filter(p => p._id !== discussion.host._id)
                    .map(participant => (
                      <div key={participant._id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={participant.avatarUrl} />
                          <AvatarFallback>{participant.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{participant.username}</p>
                          <p className="text-xs text-muted-foreground">Participant</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p className="text-sm">
                      Started: {format(new Date(discussion.startTime), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  
                  {discussion.status === "ended" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <p className="text-sm">
                        Ended: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Discussion; 