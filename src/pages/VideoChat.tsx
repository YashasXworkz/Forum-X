import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import VideoConference from '@/components/discussion/VideoConference';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const VideoChat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const roomIdFromQuery = searchParams.get('roomID');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use roomId from URL params or from query string
  const effectiveRoomId = roomId || roomIdFromQuery || '';
  
  useEffect(() => {
    if (!effectiveRoomId) {
      toast.error('Room ID Required. A valid room ID is required to join a video chat');
      navigate('/');
    }
  }, [effectiveRoomId, navigate]);
  
  useEffect(() => {
    if (!user) {
      toast.error('Authentication Required. You need to be logged in to join a video chat');
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleBack = () => {
    navigate('/');
  };
  
  if (!effectiveRoomId) {
    return null;
  }
  
  return (
    <div className="h-screen w-screen bg-background">
      <VideoConference 
        discussionId={effectiveRoomId} 
        onBack={handleBack}
      />
    </div>
  );
};

export default VideoChat; 