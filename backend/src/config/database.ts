import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get the absolute path to the .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Looking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Load environment variables from .env file
dotenv.config({ path: envPath });

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forumx';

// Debug log the connection string
console.log('MongoDB URI being used:', MONGODB_URI);

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Force using the MongoDB URI from your .env file
    const connectionString = 'mongodb+srv://vamsi:vamsi@cluster0.bs35jrd.mongodb.net/forumx_db';
    console.log('Connecting to MongoDB with URI:', connectionString);
    
    const conn = await mongoose.connect(connectionString, {
      // Add these options for better reliability
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      maxPoolSize: 10 // Maintain up to 10 socket connections
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Close MongoDB connection
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
};

export default connectDB; 