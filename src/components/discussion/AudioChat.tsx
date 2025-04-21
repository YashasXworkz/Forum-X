import React, { useState, useEffect } from 'react';
import { audioService } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { Mic, MicOff, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface AudioChatProps {
  discussionId: string;
}

interface Participant {
  userId: string;
  username: string;
  isSpeaking: boolean;
}

const AudioChat: React.FC<AudioChatProps> = ({ discussionId }) => {
  const { user, token } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize audio service on component mount
  useEffect(() => {
    if (!user || !token) {
      setError('You must be logged in to use voice chat');
      return;
    }

    setIsConnecting(true);
    
    // Initialize audio service with user details
    audioService
      .initialize(token, user._id, user.username)
      .onConnected(() => {
        setIsConnected(true);
        setIsConnecting(false);
      })
      .onError((error) => {
        console.error('Audio chat error:', error);
        setError(error.message);
        setIsConnecting(false);
      })
      .onUserJoined((user) => {
        setParticipants(prev => {
          // Only add if not already in the list
          if (!prev.some(p => p.userId === user.userId)) {
            return [...prev, {
              userId: user.userId,
              username: user.username,
              isSpeaking: user.isSpeaking
            }];
          }
          return prev;
        });
        
        toast.info(`${user.username} joined the voice chat`);
      })
      .onUserLeft((userId) => {
        setParticipants(prev => prev.filter(p => p.userId !== userId));
      })
      .onSpeakingChange((userId, isSpeaking) => {
        setParticipants(prev => 
          prev.map(p => p.userId === userId ? { ...p, isSpeaking } : p)
        );
      });
    
    // Join the discussion
    const connectToVoiceChat = async () => {
      try {
        const joined = await audioService.joinDiscussion(discussionId);
        if (!joined) {
          setError('Failed to join voice chat. Please check your microphone permissions.');
          setIsConnecting(false);
        }
      } catch (error) {
        console.error('Error joining discussion:', error);
        setError('Failed to join voice chat: ' + (error as Error).message);
        setIsConnecting(false);
      }
    };
    
    connectToVoiceChat();
    
    // Cleanup on unmount
    return () => {
      audioService.cleanup();
    };
  }, [discussionId, user, token]);
  
  // Update participants when users change
  useEffect(() => {
    if (isConnected) {
      setParticipants(audioService.getUsers());
    }
  }, [isConnected]);
  
  // Handle mute/unmute
  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    
    toast.info(muted ? 'Microphone muted' : 'Microphone unmuted');
  };
  
  // Retry connection
  const retryConnection = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const joined = await audioService.joinDiscussion(discussionId);
      if (!joined) {
        setError('Failed to join voice chat. Please check your microphone permissions.');
      }
    } catch (error) {
      setError('Failed to join voice chat: ' + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Check if microphone is not available
  const needsMicrophonePermission = error?.includes('microphone');
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-2 bg-secondary/30 rounded-md">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Voice Chat</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>
        
        <Button
          size="sm"
          variant={isMuted ? "destructive" : "outline"}
          onClick={toggleMute}
          disabled={isConnecting || !isConnected || !!error}
          className="relative"
        >
          {isMuted ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </div>
      
      {isConnecting && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-pulse h-8 w-8 rounded-full bg-primary/20 mb-3"></div>
          <p className="text-sm text-muted-foreground">Connecting to voice chat...</p>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="text-destructive mb-2">
            <MicOff className="h-10 w-10 mx-auto mb-2 opacity-70" />
            <p className="font-medium">Voice Chat Error</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          
          {needsMicrophonePermission ? (
            <div className="space-y-3 w-full max-w-xs">
              <p className="text-xs">
                Please allow microphone access in your browser settings to use voice chat.
              </p>
              <Button variant="outline" size="sm" onClick={retryConnection}>
                Try Again
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={retryConnection}>
              Reconnect
            </Button>
          )}
        </div>
      )}
      
      {!isConnecting && !error && (
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className={`flex items-center p-2 rounded-md ${
                  participant.isSpeaking ? 'bg-primary/10 animate-pulse' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {participant.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {participant.isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-3 w-3 border-2 border-background"></span>
                  )}
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {participant.username}
                    {participant.userId === user?._id && ' (You)'}
                  </p>
                </div>
                
                {participant.userId === user?._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
            
            {participants.length === 0 && (
              <div className="text-center py-8 opacity-70">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No one is in voice chat yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first to start speaking
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AudioChat; 