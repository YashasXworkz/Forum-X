import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Types
interface VideoConferenceProps {
  discussionId: string;
  onBack?: () => void;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

const VideoConference: React.FC<VideoConferenceProps> = ({ discussionId, onBack }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load ZegoCloud script
    const loadZegoScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.ZegoUIKitPrebuilt) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load ZegoCloud SDK"));
        document.body.appendChild(script);
      });
    };

    const initializeZegoCloud = async () => {
      try {
        await loadZegoScript();
        
        if (!containerRef.current || !window.ZegoUIKitPrebuilt) return;
        
        // Parameters for the connection
        const roomID = discussionId;
        const userID = user?._id || Math.floor(Math.random() * 10000).toString();
        const userName = user?.username || "Guest";
        const appID = 434816214;
        const serverSecret = "34ed80675b0aaaa71730529f563dd474";
        
        // Generate token
        const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, 
          serverSecret, 
          roomID, 
          userID, 
          userName
        );
        
        // Create ZegoUIKit instance
        const zp = window.ZegoUIKitPrebuilt.create(kitToken);
        
        // Join the room
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [{
            name: 'Personal link',
            url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
          }],
          scenario: {
            mode: window.ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: false,
          turnOnCameraWhenJoining: false,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 50,
          layout: "Grid",
          showLayoutButton: true,
        });
      } catch (error) {
        console.error("Error initializing ZegoCloud:", error);
      }
    };

    initializeZegoCloud();
    
    // Cleanup
    return () => {
      const zegoScript = document.querySelector('script[src="https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js"]');
      if (zegoScript) {
        zegoScript.remove();
      }
    };
  }, [discussionId, user]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="flex flex-col h-full border-0 shadow-none overflow-hidden relative">
      <Button 
        onClick={handleBack}
        variant="default"
        className="absolute top-2 left-2 z-50 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex-1 rounded-md overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full h-full rounded-md overflow-hidden"
          style={{ minHeight: '80vh' }}
        />
      </div>
    </Card>
  );
};

export default VideoConference; 