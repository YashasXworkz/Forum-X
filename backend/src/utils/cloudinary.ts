import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Log Cloudinary config (without sensitive data)
console.log('Cloudinary Config:', {
  cloud_name_set: !!process.env.CLOUDINARY_NAME,
  api_key_set: !!process.env.CLOUDINARY_KEY,
  api_secret_set: !!process.env.CLOUDINARY_SECRET
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use local disk storage for debugging
const diskStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// For debugging: Use local disk storage instead of Cloudinary
export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Allowed formats: jpg, jpeg, png, gif, webp'));
    }
  }
});

// Upload a single image to Cloudinary
export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'forumx',
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload an audio file to Cloudinary
export const uploadAudio = async (file: Express.Multer.File): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'forumx',
      resource_type: 'video',
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload audio');
  }
};

// Delete an image from Cloudinary
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from the URL
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(`forumx/${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

export const deleteCloudinaryAsset = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(`forumx/${publicId}`);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export default cloudinary; 