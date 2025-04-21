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
    
    // Initialize socket with auth token
    this.socket = io(`${API_URL}/audio`, {
      auth: { token },
      transports: ['websocket'],
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
    
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Audio service disconnected from server');
      this.cleanupPeerConnections();
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
    if (!this.socket || !this.connected) {
      throw new Error('Audio service not connected');
    }
    
    this.discussionId = discussionId;
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.microphoneAccessGranted = true;
      
      // Set up audio context for voice activity detection
      this.setupAudioContext(stream);
      
      // Store local stream
      this.localStream = stream;
      
      // Join the discussion room
      this.socket.emit('join-discussion', { discussionId });
      
      // Set up voice activity detection
      this.startVoiceActivityDetection();
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Could not access microphone. Please check your permissions.'));
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
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    // Add local tracks to the connection
    if (this.localStream && !this.isMuted) {
      this.localStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      const user = this.users.get(userId);
      if (user) {
        // Store the remote stream
        const [audioTrack] = event.streams[0].getAudioTracks();
        user.stream = event.streams[0];
        user.audioTrack = audioTrack;
      }
    };
    
    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate
        });
      }
    };
    
    // Connection state change
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}: ${pc.connectionState}`);
    };
    
    // Store the peer connection
    this.peerConnections[userId] = pc;
    
    // Create and send offer if we're the initiator
    if (this.socket?.id && this.socket.id < userId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      this.socket.emit('offer', {
        to: userId,
        offer
      });
    }
    
    return pc;
  }
  
  private cleanupPeerConnection(userId: string) {
    const pc = this.peerConnections[userId];
    if (pc) {
      pc.close();
      delete this.peerConnections[userId];
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
  }
}

// Export singleton instance
export const audioService = new AudioService(); 