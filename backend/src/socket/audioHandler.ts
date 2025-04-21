import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../utils/jwt';

interface AudioUser {
  userId: string;
  username: string;
  socketId: string;
}

interface AudioSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}

// Map of discussion rooms and their participants
const audioRooms = new Map<string, Map<string, AudioUser>>();

// Update JWT_SECRET for consistency
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_forumx';

export default function setupAudioHandler(io: Server) {
  // Create a namespace for audio communications
  const audioNamespace = io.of('/audio');
  
  // Middleware for authentication
  audioNamespace.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify the token
      const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      if (!user) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Attach user data to socket
      (socket as AudioSocket).data.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });
  
  audioNamespace.on('connection', (socket: AudioSocket) => {
    const user = socket.data.user;
    
    console.log(`Audio socket connected: ${user.username} (${user.id})`);
    
    // Join a discussion
    socket.on('join-discussion', ({ discussionId }) => {
      if (!discussionId) return;
      
      console.log(`User ${user.username} joining audio room: ${discussionId}`);
      
      // Create room if it doesn't exist
      if (!audioRooms.has(discussionId)) {
        audioRooms.set(discussionId, new Map());
      }
      
      // Add user to room
      const room = audioRooms.get(discussionId)!;
      const audioUser: AudioUser = {
        userId: user.id.toString(),
        username: user.username,
        socketId: socket.id
      };
      room.set(socket.id, audioUser);
      
      // Join the socket room
      socket.join(discussionId);
      
      // Send current participants to the new user
      const participants = Array.from(room.values());
      socket.emit('participants', participants);
      
      // Notify others about the new participant
      socket.to(discussionId).emit('user-joined', {
        userId: user.id.toString(),
        username: user.username
      });
    });
    
    // Leave a discussion
    socket.on('leave-discussion', ({ discussionId }) => {
      if (!discussionId) return;
      
      console.log(`User ${user.username} leaving audio room: ${discussionId}`);
      
      socket.leave(discussionId);
      
      handleUserLeaveRoom(socket, discussionId);
    });
    
    // WebRTC signaling
    socket.on('offer', ({ to, offer }) => {
      socket.to(to).emit('offer', {
        from: socket.id,
        offer
      });
    });
    
    socket.on('answer', ({ to, answer }) => {
      socket.to(to).emit('answer', {
        from: socket.id,
        answer
      });
    });
    
    socket.on('ice-candidate', ({ to, candidate }) => {
      socket.to(to).emit('ice-candidate', {
        from: socket.id,
        candidate
      });
    });
    
    // Speaking indicator
    socket.on('speaking', ({ discussionId, isSpeaking }) => {
      if (!discussionId) return;
      
      socket.to(discussionId).emit('speaking', {
        userId: socket.id,
        isSpeaking
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Audio socket disconnected: ${user.username}`);
      
      // Clean up all rooms that this user was in
      for (const [discussionId, room] of audioRooms.entries()) {
        if (room.has(socket.id)) {
          handleUserLeaveRoom(socket, discussionId);
        }
      }
    });
    
    // Helper function to handle user leaving a room
    function handleUserLeaveRoom(socket: AudioSocket, discussionId: string) {
      const room = audioRooms.get(discussionId);
      if (!room) return;
      
      // Remove user from room
      const user = room.get(socket.id);
      if (user) {
        room.delete(socket.id);
        
        // Notify others
        socket.to(discussionId).emit('user-left', socket.id);
        
        // Delete empty rooms
        if (room.size === 0) {
          audioRooms.delete(discussionId);
        }
      }
    }
  });
  
  return audioNamespace;
} 