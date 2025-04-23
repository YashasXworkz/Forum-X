import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import http from 'http';
import { connectDB } from './config/database';
import { errorHandler } from './utils';
import routes from './routes';
import jwt from 'jsonwebtoken';
import { JwtPayload, verifyToken } from './utils/jwt';
import DiscussionMessage from './models/DiscussionMessage';
import mongoose from 'mongoose';
import setupAudioHandler from './socket/audioHandler';
import path from 'path';

// Note: Environment variables are already loaded in database.ts and jwt.ts

// Connect to database
connectDB();

interface SocketUser extends Socket {
  data: {
    user: JwtPayload;
  };
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Frontend URLs
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup audio namespace for WebRTC
setupAudioHandler(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use(routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

// Update JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_forumx';

// Socket.io Authentication middleware
io.use((socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('Socket auth: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    
    // Verify token using our shared verification function
    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('Socket auth: Token verification failed');
      return next(new Error('Authentication error: Invalid token'));
    }
    
    // Initialize user data object if it doesn't exist
    if (!socket.data) {
      socket.data = { user: decoded };
    } else {
      socket.data.user = decoded;
    }
    
    console.log(`Socket auth successful for user: ${decoded.username} (${decoded.id})`);
    next();
  } catch (err: any) {
    console.error('Socket auth error:', err.message);
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection and event handling
io.on('connection', (socket: Socket) => {
  try {
    const user = socket.data?.user;
    console.log(`User connected: ${socket.id} - User: ${user?.username || 'Unknown'}`);
    
    // Join a discussion room
    socket.on('joinDiscussion', (discussionId: string) => {
      if (!discussionId) {
        console.error('Invalid discussion ID');
        return;
      }
      
      const roomName = `discussion:${discussionId}`;
      socket.join(roomName);
      console.log(`User ${user?.id} joined discussion ${discussionId}`);
      
      // Notify others that a user has joined
      socket.to(roomName).emit('userJoined', {
        userId: user?.id,
        username: user?.username
      });
    });
    
    // Leave a discussion room
    socket.on('leaveDiscussion', (discussionId: string) => {
      if (!discussionId) {
        console.error('Invalid discussion ID');
        return;
      }
      
      const roomName = `discussion:${discussionId}`;
      socket.leave(roomName);
      console.log(`User ${user?.id} left discussion ${discussionId}`);
      
      // Notify others that a user has left
      socket.to(roomName).emit('userLeft', {
        userId: user?.id,
        username: user?.username
      });
    });
    
    // Send a message to a discussion room
    socket.on('sendMessage', async (data: { discussionId: string; content: string }) => {
      if (!data || !data.discussionId || !data.content) {
        console.error('Invalid message data', data);
        return;
      }
      
      const { discussionId, content } = data;
      const roomName = `discussion:${discussionId}`;
      
      console.log(`Message from ${user?.username} to ${roomName}: ${content.substring(0, 30)}...`);
      
      try {
        // Save message to database
        const newMessage = await DiscussionMessage.create({
          discussionId: new mongoose.Types.ObjectId(discussionId),
          sender: new mongoose.Types.ObjectId(user?.id),
          senderUsername: user?.username,
          content
        });
        
        // Create message object to send to clients
        const message: ChatMessage = {
          id: newMessage._id.toString(),
          userId: user?.id,
          username: user?.username,
          content,
          timestamp: newMessage.createdAt
        };
        
        // Broadcast the message to everyone in the room
        io.to(roomName).emit('newMessage', message);
        
        console.log(`Message saved to database with ID: ${newMessage._id}`);
      } catch (error) {
        console.error('Error saving message to database:', error);
        // Still send the message even if database save fails
        const message: ChatMessage = {
          id: Date.now().toString(),
          userId: user?.id,
          username: user?.username,
          content,
          timestamp: new Date()
        };
        io.to(roomName).emit('newMessage', message);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (discussionId: string) => {
      if (!discussionId) return;
      
      const roomName = `discussion:${discussionId}`;
      socket.to(roomName).emit('userTyping', {
        userId: user?.id,
        username: user?.username
      });
    });
    
    socket.on('stopTyping', (discussionId: string) => {
      if (!discussionId) return;
      
      const roomName = `discussion:${discussionId}`;
      socket.to(roomName).emit('userStoppedTyping', {
        userId: user?.id
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id} - Reason: ${reason}`);
    });
  } catch (error: any) {
    console.error('Socket error in connection handler:', error.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.io server is also running`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app; 