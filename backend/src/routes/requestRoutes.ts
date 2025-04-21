import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest
} from '../controllers';
import { protect, validateRequestInput } from '../middleware';

const router = express.Router();

// All request routes are protected
router.use(protect);

router.post('/', validateRequestInput, createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);
router.delete('/:id', deleteRequest);

export default router; 