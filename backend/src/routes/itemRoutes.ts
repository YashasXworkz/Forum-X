import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleItemAvailability
} from '../controllers';
import { protect, validateItemInput } from '../middleware';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected routes
router.post('/', protect, validateItemInput, createItem);
router.put('/:id', protect, validateItemInput, updateItem);
router.delete('/:id', protect, deleteItem);
router.patch('/:id/toggle-availability', protect, toggleItemAvailability);

export default router; 