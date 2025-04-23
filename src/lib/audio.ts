import { io, Socket } from 'socket.io-client';
import { API_URL } from './axios';

interface AudioUser {
  userId: string;
  username: string;
  stream?: MediaStream;
  audioTrack?: MediaStreamTrack;
  isSpeaking: boolean;
}

class AudioService {
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections: Record<string, RTCPeerConnection> = {};
  private connected: boolean = false;
  private discussionId: string | null = null;
  private audioContext: AudioContext | null = null;
  private audioAnalyser: AnalyserNode | null = null;
  private users: Map<string, AudioUser> = new Map();
  private speakingThreshold: number = -50; // dB threshold for speaking detection
  private onSpeakingChangeCallback: ((userId: string, isSpeaking: boolean) => void) | null = null;
  private onUserJoinedCallback: ((user: AudioUser) => void) | null = null;
  private onUserLeftCallback: ((userId: string) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private isMuted: boolean = false;
  private microphoneAccessGranted: boolean = false;
  private voiceActivityDetectionInterval: number | null = null;
  
  initialize(token: string, userId: string, username: string) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    console.log('Initializing audio service with token:', token ? 'Token provided' : 'No token!');
    
    // Initialize socket with auth token
    this.socket = io(`${API_URL}/audio`, {
      auth: { token },
      transports: ['websocket', 'polling'], // Add fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    // Set up socket event listeners
    this.setupSocketListeners(userId, username);
    
    return this;
  }
  
  private setupSocketListeners(userId: string, username: string) {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Audio service connected to server');
      
      // Add self to users
      this.users.set(userId, {
        userId,
        username,
        isSpeaking: false
      });
      
      if (this.onConnectedCallback) {
        this.onConnectedCallback();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Audio service connection error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`Connection error: ${error.message}`));
      }
    });
    
    this.socket.on('connect_timeout', () => {
      console.error('Audio service connection timeout');
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Connection timed out. Please check your network.'));
      }
    });
    
    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log(`Audio service disconnected from server: ${reason}`);
      this.cleanupPeerConnections();
      
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // The disconnection was initiated by the server or the client, so don't reconnect
      } else {
        // Attempt to reconnect - the socket.io library will handle this
        console.log('Attempting to reconnect...');
      }
    });
    
    this.socket.on('user-joined', async (data: { userId: string, username: string }) => {
      console.log(`User joined: ${data.username} (${data.userId})`);
      
      // Add to users
      const newUser: AudioUser = {
        userId: data.userId,
        username: data.username,
        isSpeaking: false
      };
      this.users.set(data.userId, newUser);
      
      // Create peer connection for the new user
      await this.createPeerConnection(data.userId);
      
      // Notify caller
      if (this.onUserJoinedCallback) {
        this.onUserJoinedCallback(newUser);
      }
    });
    
    this.socket.on('user-left', (userId: string) => {
      console.log(`User left: ${userId}`);
      
      // Remove peer connection
      this.cleanupPeerConnection(userId);
      
      // Remove from users
      const user = this.users.get(userId);
      this.users.delete(userId);
      
      // Notify caller
      if (this.onUserLeftCallback && user) {
        this.onUserLeftCallback(userId);
      }
    });
    
    this.socket.on('offer', async (data: { from: string, offer: RTCSessionDescriptionInit }) => {
      console.log(`Received offer from ${data.from}`);
      
      // Create peer connection if it doesn't exist
      if (!this.peerConnections[data.from]) {
        await this.createPeerConnection(data.from);
      }
      
      const pc = this.peerConnections[data.from];
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      this.socket?.emit('answer', {
        to: data.from,
        answer
      });
    });
    
    this.socket.on('answer', async (data: { from: string, answer: RTCSessionDescriptionInit }) => {
      console.log(`Received answer from ${data.from}`);
      
      const pc = this.peerConnections[data.from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });
    
    this.socket.on('ice-candidate', async (data: { from: string, candidate: RTCIceCandidateInit }) => {
      const pc = this.peerConnections[data.from];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
    
    this.socket.on('speaking', (data: { userId: string, isSpeaking: boolean }) => {
      const user = this.users.get(data.userId);
      if (user) {
        user.isSpeaking = data.isSpeaking;
        
        if (this.onSpeakingChangeCallback) {
          this.onSpeakingChangeCallback(data.userId, data.isSpeaking);
        }
      }
    });
    
    this.socket.on('error', (error: string) => {
      console.error('Audio service error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(error));
      }
    });
  }
  
  async joinDiscussion(discussionId: string) {
    // Wait until socket is connected
    if (!this.socket) {
      throw new Error('Audio service socket not initialized');
    }
    
    if (!this.connected) {
      console.log('Socket not yet connected, waiting...');
      // Wait for up to 5 seconds for the socket to connect
      let retries = 0;
      const maxRetries = 10;
      
      while (!this.connected && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
        console.log(`Waiting for socket connection... (${retries}/${maxRetries})`);
      }
      
      if (!this.connected) {
        throw new Error('Audio service failed to connect after waiting. Please try again.');
      }
    }
    
    this.discussionId = discussionId;
    
    try {
      console.log('Requesting microphone access...');
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.microphoneAccessGranted = true;
      
      // Set up audio context for voice activity detection
      this.setupAudioContext(stream);
      
      // Store local stream
      this.localStream = stream;
      
      console.log(`Joining discussion room: ${discussionId}`);
      // Join the discussion room
      this.socket.emit('join-discussion', { discussionId });
      
      // Set up voice activity detection
      this.startVoiceActivityDetection();
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`Could not access microphone. Please check your permissions: ${error.message}`));
      }
      return false;
    }
  }
  
  leaveDiscussion() {
    if (!this.socket || !this.discussionId) return;
    
    // Stop voice activity detection
    this.stopVoiceActivityDetection();
    
    // Leave the discussion room
    this.socket.emit('leave-discussion', { discussionId: this.discussionId });
    
    // Clean up
    this.cleanupPeerConnections();
    this.cleanupLocalStream();
    this.discussionId = null;
  }
  
  private async createPeerConnection(userId: string) {
    // Clean up existing connection if any
    this.cleanupPeerConnection(userId);
    
    try {
      console.log(`Creating new peer connection for ${userId}`);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // Add TURN servers if available for better NAT traversal
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ],
        iceCandidatePoolSize: 10
      });
      
      // Log all ICE connection state changes
      pc.onicecandidateerror = (event) => {
        console.warn(`ICE candidate error for ${userId}:`, event);
      };
      
      pc.onnegotiationneeded = async () => {
        console.log(`Negotiation needed for peer connection with ${userId}`);
        
        try {
          // Create offer when negotiation is needed
          let offer;
          try {
            // Modern browsers
            offer = await pc.createOffer({
              offerToReceiveAudio: true
            });
          } catch (err) {
            // Fallback for older browsers
            console.log('Using fallback offer creation');
            offer = await pc.createOffer();
          }
          
          await pc.setLocalDescription(offer);
          
          this.socket?.emit('offer', {
            to: userId,
            offer
          });
        } catch (error) {
          console.error(`Error during negotiation with ${userId}:`, error);
        }
      };

      // Add local tracks to the connection
      if (this.localStream && !this.isMuted) {
        console.log(`Adding local tracks to peer connection for ${userId}`);
        this.localStream.getAudioTracks().forEach(track => {
          console.log(`Adding audio track to peer connection for ${userId}:`, track.label, track.enabled);
          try {
            pc.addTrack(track, this.localStream!);
          } catch (err) {
            console.error(`Error adding track to peer connection for ${userId}:`, err);
          }
        });
      }
      
      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log(`Received track from ${userId}`, event.streams[0]);
        console.log(`Track info:`, {
          kind: event.track.kind,
          enabled: event.track.enabled,
          readyState: event.track.readyState,
          muted: event.track.muted,
          id: event.track.id
        });
        
        const user = this.users.get(userId);
        if (user) {
          // Store the remote stream
          user.stream = event.streams[0];
          if (event.track.kind === 'audio') {
            user.audioTrack = event.track;
            // Play the track immediately
            this.playRemoteStream(userId, event.streams[0]);
          }
        }
      };
      
      // ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${userId}:`, event.candidate.candidate.substring(0, 50) + '...');
          this.socket?.emit('ice-candidate', {
            to: userId,
            candidate: event.candidate
          });
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log(`ICE gathering state for ${userId}: ${pc.iceGatheringState}`);
      };

      // Connection state change
      pc.onconnectionstatechange = () => {
        console.log(`Connection state change for ${userId}: ${pc.connectionState}`);
        if (pc.connectionState === 'connected') {
          console.log(`Connected successfully to ${userId}`);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn(`Connection to ${userId} ${pc.connectionState}, attempting to reconnect`);
          this.cleanupPeerConnection(userId);
          setTimeout(() => this.createPeerConnection(userId), 1000);
        }
      };
      
      // ICE connection state change
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state change for ${userId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          console.warn(`ICE connection to ${userId} failed, attempting to restart ICE`);
          pc.restartIce();
        }
      };
      
      // Store the peer connection
      this.peerConnections[userId] = pc;
      
      // Create and send offer (if we're the initiator)
      // Only initiate from the peer with the "smaller" ID to avoid both sides creating offers
      const shouldInitiate = this.socket?.id && userId > this.socket.id;
      if (shouldInitiate) {
        console.log(`Creating offer for ${userId}`);
        try {
          let offer;
          try {
            // Modern browsers
            offer = await pc.createOffer({
              offerToReceiveAudio: true
            });
          } catch (err) {
            // Fallback for older browsers
            console.log('Using fallback offer creation');
            offer = await pc.createOffer();
          }
          
          console.log(`Created offer for ${userId}`);
          await pc.setLocalDescription(offer);
          console.log(`Set local description for ${userId}`);
          
          this.socket?.emit('offer', {
            to: userId,
            offer
          });
          console.log(`Sent offer to ${userId}`);
        } catch (error) {
          console.error(`Error creating/sending offer to ${userId}:`, error);
        }
      }
      
      return pc;
    } catch (error) {
      console.error(`Error creating peer connection for ${userId}:`, error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`Failed to establish voice connection: ${error.message}`));
      }
      return null;
    }
  }
  
  private cleanupPeerConnection(userId: string) {
    const pc = this.peerConnections[userId];
    if (pc) {
      pc.close();
      delete this.peerConnections[userId];
      
      // Remove the audio element
      const audioElement = document.getElementById(`remote-audio-${userId}`);
      if (audioElement) {
        audioElement.remove();
      }
    }
  }
  
  private cleanupPeerConnections() {
    Object.keys(this.peerConnections).forEach(userId => {
      this.cleanupPeerConnection(userId);
    });
  }
  
  private cleanupLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.audioAnalyser = null;
    }
  }
  
  private setupAudioContext(stream: MediaStream) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.audioAnalyser = this.audioContext.createAnalyser();
      
      this.audioAnalyser.fftSize = 512;
      this.audioAnalyser.smoothingTimeConstant = 0.4;
      source.connect(this.audioAnalyser);
    } catch (e) {
      console.error('Error setting up audio context:', e);
    }
  }
  
  private startVoiceActivityDetection() {
    if (!this.audioAnalyser) return;
    
    const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    let lastSpeakingState = false;
    
    this.voiceActivityDetectionInterval = window.setInterval(() => {
      if (!this.audioAnalyser || !this.socket || this.isMuted) return;
      
      // Get current audio level
      this.audioAnalyser.getByteFrequencyData(dataArray);
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / dataArray.length;
      
      // Convert to dB
      const dB = 20 * Math.log10(average / 255);
      
      // Check if speaking
      const isSpeaking = dB > this.speakingThreshold;
      
      // Notify server and update UI if speaking state changed
      if (isSpeaking !== lastSpeakingState) {
        lastSpeakingState = isSpeaking;
        
        if (this.socket && this.discussionId) {
          this.socket.emit('speaking', { 
            discussionId: this.discussionId,
            isSpeaking
          });
        }
        
        // Update local user
        const userId = this.socket.id;
        const user = this.users.get(userId);
        if (user) {
          user.isSpeaking = isSpeaking;
          
          if (this.onSpeakingChangeCallback) {
            this.onSpeakingChangeCallback(userId, isSpeaking);
          }
        }
      }
    }, 200);
  }
  
  private stopVoiceActivityDetection() {
    if (this.voiceActivityDetectionInterval !== null) {
      clearInterval(this.voiceActivityDetectionInterval);
      this.voiceActivityDetectionInterval = null;
    }
  }
  
  // Public methods for callbacks
  onSpeakingChange(callback: (userId: string, isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallback = callback;
    return this;
  }
  
  onUserJoined(callback: (user: AudioUser) => void) {
    this.onUserJoinedCallback = callback;
    return this;
  }
  
  onUserLeft(callback: (userId: string) => void) {
    this.onUserLeftCallback = callback;
    return this;
  }
  
  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
    return this;
  }
  
  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
    return this;
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    
    return this.isMuted;
  }
  
  setMute(muted: boolean) {
    if (this.isMuted !== muted) {
      return this.toggleMute();
    }
    return this.isMuted;
  }
  
  isMicrophoneAccessGranted() {
    return this.microphoneAccessGranted;
  }
  
  getUsers() {
    return Array.from(this.users.values());
  }
  
  cleanup() {
    this.leaveDiscussion();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.cleanupPeerConnections();
    this.cleanupLocalStream();
    this.stopVoiceActivityDetection();
    
    // Remove all audio elements created by this service
    document.querySelectorAll('[id^="remote-audio-"]').forEach(el => {
      el.remove();
    });
    
    this.connected = false;
    this.discussionId = null;
    this.users.clear();
  }
  
  private playRemoteStream(userId: string, stream: MediaStream) {
    // First, check if we already have an audio element for this user
    const existingAudio = document.getElementById(`remote-audio-${userId}`) as HTMLAudioElement;
    if (existingAudio) {
      existingAudio.srcObject = stream;
      existingAudio.play().catch(err => {
        console.error(`Error playing existing audio for user ${userId}:`, err);
      });
      return;
    }
    
    console.log(`Creating new audio element for user ${userId}`);
    
    // Create a new audio element
    const audio = document.createElement('audio');
    audio.id = `remote-audio-${userId}`;
    audio.srcObject = stream;
    
    // Critical settings for audio playback
    audio.autoplay = true;
    audio.muted = false; // Ensure it's not muted
    audio.volume = 1.0;  // Maximum volume
    
    // Some browsers require these attributes
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('controls', 'true'); // For debugging - makes the audio player visible
    
    // Make it visible for debugging (you can hide it later)
    audio.style.position = 'fixed';
    audio.style.bottom = '20px';
    audio.style.right = '20px';
    audio.style.width = '300px';
    audio.style.zIndex = '9999';
    
    // Append to the DOM
    document.body.appendChild(audio);
    
    console.log(`Created audio element for user ${userId}, attempting to play...`);
    
    // Monitor audio status
    audio.onplaying = () => {
      console.log(`Audio for user ${userId} is now playing!`);
    };
    
    audio.onwaiting = () => {
      console.log(`Audio for user ${userId} is waiting for data...`);
    };
    
    audio.onstalled = () => {
      console.log(`Audio for user ${userId} playback has stalled`);
    };
    
    // Start playing - this may trigger autoplay policy in some browsers
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(err => {
        console.error(`Error playing audio for user ${userId}:`, err);
        
        // Handle autoplay restrictions
        if (err.name === 'NotAllowedError') {
          console.warn('Autoplay prevented by browser. Adding user interaction handler...');
          
          // Create a button to enable audio
          const enableButton = document.createElement('button');
          enableButton.innerText = 'Enable Audio';
          enableButton.style.position = 'fixed';
          enableButton.style.top = '20px';
          enableButton.style.right = '20px';
          enableButton.style.zIndex = '10000';
          enableButton.style.padding = '10px';
          enableButton.style.backgroundColor = '#4CAF50';
          enableButton.style.color = 'white';
          enableButton.style.border = 'none';
          enableButton.style.borderRadius = '5px';
          enableButton.style.cursor = 'pointer';
          
          enableButton.onclick = () => {
            audio.play();
            enableButton.remove();
          };
          
          document.body.appendChild(enableButton);
        }
      });
    }
  }
}

// Export singleton instance
export const audioService = new AudioService(); 