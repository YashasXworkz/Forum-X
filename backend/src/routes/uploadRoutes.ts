import express from 'express';
import { Request, Response } from 'express';
import { upload } from '../utils/cloudinary';
import { protect } from '../middleware/auth';
import { createError } from '../utils/errorHandler';
import path from 'path';

const router = express.Router();

// Middleware to handle multer errors
const handleMulterErrors = (err: any, req: Request, res: Response, next: Function) => {
  console.error('Multer error:', err);
  
  if (err && err.message) {
    if (err.message.includes('format') || err.message.includes('allowed')) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Allowed formats: jpg, jpeg, png, gif, webp'
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      });
    }
  }
  
  // For other errors
  return res.status(500).json({
    success: false,
    error: err.message || 'File upload error'
  });
};

// @desc    Upload image to local storage (temporary)
// @route   POST /api/upload
// @access  Private
router.post('/', 
  protect, 
  (req, res, next) => {
    console.log('Upload request received, user:', req.user?._id);
    console.log('Request content type:', req.headers['content-type']);
    
    // Skip the file check since multer will handle it
    // With multipart/form-data, the body may be empty until multer processes it
    
    console.log('Processing file upload with multer');
    // Process the upload
    upload.single('image')(req, res, function(err) {
      if (err) {
        console.error('Multer processing error:', err);
        return handleMulterErrors(err, req, res, next);
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      console.log('Multer processed request, file:', !!req.file);
      
      if (!req.file) {
        console.error('No file after multer processing');
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }

      console.log('File uploaded, details:', {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // For local storage, construct a URL that can be accessed
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Handle Windows-style paths with backslashes
      let filePath = req.file.path.replace(/\\/g, '/');
      
      // Extract just the filename if needed
      const filename = path.basename(filePath);
      
      // Create the URL (either with path or just filename based on your server setup)
      const imageUrl = `${baseUrl}/uploads/${filename}`;
      
      console.log('Image URL constructed:', imageUrl);
      
      // Return success response with image URL
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: imageUrl // Return the constructed URL
        }
      });
    } catch (error) {
      console.error('Upload handler error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process uploaded image'
      });
    }
  }
);

export default router; 