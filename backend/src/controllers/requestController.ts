import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import RequestModel from '../models/Request';
import Item from '../models/Item';
import Notification from '../models/Notification';

/**
 * @desc    Create a new request for an item
 * @route   POST /api/requests
 * @access  Private
 */
export const createRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { itemId, message, pickupDate, returnDate } = req.body;

  // Check if item exists
  const item = await Item.findById(itemId);
  if (!item) {
    return next(createError('Item not found', 404));
  }

  // Check if item is available
  if (!item.isAvailable) {
    return next(createError('Item is not available for borrowing', 400));
  }

  // Check if user is not the owner
  if (item.owner.toString() === req.user._id.toString()) {
    return next(createError('You cannot request your own item', 400));
  }

  // Check if user already has a pending request for this item
  const existingRequest = await RequestModel.findOne({
    item: itemId,
    requester: req.user._id,
    status: 'pending'
  });

  if (existingRequest) {
    return next(createError('You already have a pending request for this item', 400));
  }

  // Create request
  const request = await RequestModel.create({
    item: itemId,
    requester: req.user._id,
    message,
    pickupDate,
    returnDate
  });

  // Create notification for item owner
  await Notification.create({
    recipient: item.owner,
    sender: req.user._id,
    type: 'request',
    content: `${req.user.username} has requested to borrow your item "${item.name}"`,
    relatedItem: itemId,
    relatedRequest: request._id
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

/**
 * @desc    Get all requests (filtered by user role)
 * @route   GET /api/requests
 * @access  Private
 */
export const getRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { status, item } = req.query;
  
  // Build query
  const query: any = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by item
  if (item) {
    query.item = item;
  }
  
  // Filter by user (either as requester or item owner)
  const userId = req.user._id;
  const userItems = await Item.find({ owner: userId }).select('_id');
  const userItemIds = userItems.map(item => item._id);
  
  if (req.query.type === 'outgoing') {
    // Outgoing requests (user is the requester)
    query.requester = userId;
  } else if (req.query.type === 'incoming') {
    // Incoming requests (user is the item owner)
    query.item = { $in: userItemIds };
  } else {
    // All requests related to user (either as requester or item owner)
    query.$or = [
      { requester: userId },
      { item: { $in: userItemIds } }
    ];
  }
  
  // Execute query with pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const requests = await RequestModel.find(query)
    .populate('item', 'name images category')
    .populate('requester', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await RequestModel.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: requests
  });
});

/**
 * @desc    Get request by ID
 * @route   GET /api/requests/:id
 * @access  Private (owner or requester only)
 */
export const getRequestById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const request = await RequestModel.findById(req.params.id)
    .populate('item')
    .populate('requester', 'username avatarUrl bio');
  
  if (!request) {
    return next(createError('Request not found', 404));
  }
  
  // Check if user is the requester or item owner
  const item = await Item.findById(request.item);
  if (!item) {
    return next(createError('Item not found', 404));
  }
  
  if (request.requester._id.toString() !== req.user._id.toString() && 
      item.owner.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to view this request', 403));
  }
  
  res.status(200).json({
    success: true,
    data: request
  });
});

/**
 * @desc    Update request status (accept, reject, complete)
 * @route   PATCH /api/requests/:id/status
 * @access  Private (owner only for accept/reject, requester only for complete)
 */
export const updateRequestStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  
  if (!['accepted', 'rejected', 'completed'].includes(status)) {
    return next(createError('Invalid status value', 400));
  }
  
  const request = await RequestModel.findById(req.params.id);
  if (!request) {
    return next(createError('Request not found', 404));
  }
  
  const item = await Item.findById(request.item);
  if (!item) {
    return next(createError('Item not found', 404));
  }
  
  // Check authorization based on action
  if (['accepted', 'rejected'].includes(status)) {
    // Only item owner can accept or reject
    if (item.owner.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to update this request', 403));
    }
  } else if (status === 'completed') {
    // Only requester can mark as completed
    if (request.requester.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to update this request', 403));
    }
  }
  
  // Update request status
  request.status = status;
  await request.save();
  
  // Update item availability if request is accepted
  if (status === 'accepted') {
    item.isAvailable = false;
    await item.save();
  }
  
  // If status is completed, make item available again
  if (status === 'completed') {
    item.isAvailable = true;
    await item.save();
  }
  
  // Create notification
  const notificationType = status === 'accepted' ? 'acceptance' : 
                          status === 'rejected' ? 'rejection' : 'return';
  
  const recipient = status === 'completed' ? item.owner : request.requester;
  const sender = status === 'completed' ? request.requester : item.owner;
  
  const notificationContent = 
    status === 'accepted' ? `Your request to borrow "${item.name}" has been accepted` :
    status === 'rejected' ? `Your request to borrow "${item.name}" has been rejected` :
    `${req.user.username} has marked the return of "${item.name}" as completed`;
  
  await Notification.create({
    recipient,
    sender,
    type: notificationType,
    content: notificationContent,
    relatedItem: item._id,
    relatedRequest: request._id
  });
  
  res.status(200).json({
    success: true,
    data: request
  });
});

/**
 * @desc    Delete request (cancel)
 * @route   DELETE /api/requests/:id
 * @access  Private (requester only)
 */
export const deleteRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const request = await RequestModel.findById(req.params.id);
  
  if (!request) {
    return next(createError('Request not found', 404));
  }
  
  // Only requester can delete/cancel their request
  if (request.requester.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to delete this request', 403));
  }
  
  // Cannot delete if already accepted
  if (request.status === 'accepted') {
    return next(createError('Cannot cancel an accepted request', 400));
  }
  
  await request.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 