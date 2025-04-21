import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getUserById,
  deactivateAccount,
  deleteAccount
} from '../controllers';
import { protect, validateRegisterInput, validateLoginInput } from '../middleware';

const router = express.Router();

// Public routes
router.post('/register', validateRegisterInput, registerUser);
router.post('/login', validateLoginInput, loginUser);
router.get('/:id', getUserById);

// Protected routes
router.get('/profile', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/account', protect, deleteAccount);

export default router; 