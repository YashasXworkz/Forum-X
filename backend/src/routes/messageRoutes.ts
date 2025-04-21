import express from 'express';
import {
  sendMessage,
  getConversationWithUser,
  getUserConversations,
  deleteMessage
} from '../controllers';
import { protect, validateMessageInput } from '../middleware';

const router = express.Router();

// All message routes are protected
router.use(protect);

router.post('/', validateMessageInput, sendMessage);
router.get('/conversations', getUserConversations);
router.get('/conversation/:userId', getConversationWithUser);
router.delete('/:id', deleteMessage);

export default router; 