import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'forumx',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any
});

// Multer upload configuration
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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