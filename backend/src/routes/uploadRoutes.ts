import express from 'express';
import { Request, Response } from 'express';
import { upload, uploadImage } from '../utils/cloudinary';
import { protect } from '../middleware/auth';
import { errorHandler } from '../utils/errorHandler';

const router = express.Router();

// Middleware to handle multer errors
const handleMulterErrors = (err: any, req: Request, res: Response, next: Function) => {
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
  next(err);
};

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', 
  protect, 
  (req, res, next) => {
    // Wrap the multer middleware in try-catch
    try {
      upload.single('image')(req, res, function(err) {
        if (err) {
          return handleMulterErrors(err, req, res, next);
        }
        next();
      });
    } catch (err) {
      return handleMulterErrors(err, req, res, next);
    }
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload an image file'
        });
      }

      // Get the uploaded file URL from Cloudinary
      const imageUrl = req.file.path || (req.file as any).secure_url;
      
      // Return success response with image URL
      return res.status(200).json({
        success: true,
        data: {
          imageUrl
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