import { Request, Response, NextFunction } from 'express';
import { asyncHandler, createError } from '../utils';
import Item from '../models/Item';

/**
 * @desc    Create a new item
 * @route   POST /api/items
 * @access  Private
 */
export const createItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, category, condition, images, location } = req.body;

  // Create item
  const item = await Item.create({
    name,
    description,
    category,
    condition,
    images: images || [],
    owner: req.user._id,
    location
  });

  res.status(201).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Get all items with filtering
 * @route   GET /api/items
 * @access  Public
 */
export const getItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { category, condition, search, owner, available } = req.query;
  
  // Build query
  const query: any = {};

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by condition
  if (condition) {
    query.condition = condition;
  }

  // Filter by owner
  if (owner) {
    query.owner = owner;
  }

  // Filter by availability
  if (available !== undefined) {
    query.isAvailable = available === 'true';
  }

  // Search by text
  if (search) {
    query.$text = { $search: search as string };
  }

  // Execute query with pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const items = await Item.find(query)
    .populate('owner', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Item.countDocuments(query);

  res.status(200).json({
    success: true,
    count: items.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: items
  });
});

/**
 * @desc    Get item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
export const getItemById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const item = await Item.findById(req.params.id).populate('owner', 'username avatarUrl bio');

  if (!item) {
    return next(createError('Item not found', 404));
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (owner only)
 */
export const updateItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(createError('Item not found', 404));
  }

  // Check if user is the item owner
  if (item.owner.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to update this item', 403));
  }

  // Update item
  item = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: item
  });
});

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private (owner only)
 */
export const deleteItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(createError('Item not found', 404));
  }

  // Check if user is the item owner
  if (item.owner.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to delete this item', 403));
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Toggle item availability
 * @route   PATCH /api/items/:id/toggle-availability
 * @access  Private (owner only)
 */
export const toggleItemAvailability = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(createError('Item not found', 404));
  }

  // Check if user is the item owner
  if (item.owner.toString() !== req.user._id.toString()) {
    return next(createError('Not authorized to update this item', 403));
  }

  // Toggle availability
  item = await Item.findByIdAndUpdate(
    req.params.id,
    { isAvailable: !item.isAvailable },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: item
  });
}); 