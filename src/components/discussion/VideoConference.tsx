import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CameraOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Types
interface VideoConferenceProps {
  discussionId: string;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

const VideoConference: React.FC<VideoConferenceProps> = ({ discussionId }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
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

    // Style tweaks for ZegoCloud UI
    const addCustomStyles = () => {
      const styleEl = document.createElement('style');
      styleEl.id = 'zego-custom-styles';
      styleEl.textContent = `
        :root {
          --zego-primary-color: var(--primary);
          --zego-sidebar-bg-color: var(--background);
          --zego-border-color: var(--border);
          --zego-foreground-color: var(--foreground);
          --zego-button-primary-color: var(--primary);
          --zego-button-text-color: var(--primary-foreground);
        }
        
        .ZegoRoomContainer {
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: var(--background);
          color: var(--foreground);
        }
        
        .ZegoRoom_container {
          background-color: hsl(var(--card) / 0.8);
        }
        
        .ZegoButton_button {
          border-radius: 0.375rem;
        }
      `;
      document.head.appendChild(styleEl);
      
      return () => {
        const styleElement = document.getElementById('zego-custom-styles');
        if (styleElement) {
          styleElement.remove();
        }
      };
    };

    const initializeZegoCloud = async () => {
      try {
        await loadZegoScript();
        
        if (!containerRef.current || !window.ZegoUIKitPrebuilt) return;
        
        // Add custom styles before initializing
        const removeStyles = addCustomStyles();
        
        const roomID = discussionId;
        const userID = user?._id || Math.floor(Math.random() * 10000).toString();
        const userName = user?.username || "Guest";
        const appID = 1197356487;
        const serverSecret = "ae07d4117925b5e2d80c7ccb654eb4a6";
        
        const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID, 
          serverSecret, 
          roomID, 
          userID, 
          userName
        );
        
        const zp = window.ZegoUIKitPrebuilt.create(kitToken);
        
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
          branding: {
            logoURL: "",
          },
          onLeaveRoom: () => {
            // Clean up
            removeStyles();
          },
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
      
      const styleElement = document.getElementById('zego-custom-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [discussionId, user]);

  return (
    <Card className="flex flex-col h-full border-0 shadow-none overflow-hidden">
      <div className="flex-1 rounded-md overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full h-full rounded-md overflow-hidden"
          style={{ minHeight: '450px' }}
        />
      </div>
    </Card>
  );
};

export default VideoConference; 