import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Event from '../models/Event';

// @desc    Create event
// @route   POST /api/events
// @access  Private
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  req.body.organizer = req.user.id;
  
  const event = await Event.create(req.body);
  
  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  // Build query
  // Filter
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);
  
  // Search
  let query = Event.find({});
  if (req.query.search) {
    query = Event.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { genre: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }
  
  // Genre filter
  if (req.query.genre) {
    query = query.find({ genre: { $in: [req.query.genre] } });
  }
  
  // Status filter
  if (req.query.status) {
    query = query.find({ status: req.query.status });
  } else {
    // Default to only published events for public views
    query = query.find({ status: 'published' });
  }
  
  // Date filter
  if (req.query.startDate) {
    query = query.find({ date: { $gte: new Date(req.query.startDate as string) } });
  }
  
  if (req.query.endDate) {
    query = query.find({ date: { $lte: new Date(req.query.endDate as string) } });
  }
  
  // Price range filter
  if (req.query.minPrice && req.query.maxPrice) {
    query = query.find({
      ticketPrice: {
        $gte: Number(req.query.minPrice),
        $lte: Number(req.query.maxPrice)
      }
    });
  } else if (req.query.minPrice) {
    query = query.find({ ticketPrice: { $gte: Number(req.query.minPrice) } });
  } else if (req.query.maxPrice) {
    query = query.find({ ticketPrice: { $lte: Number(req.query.maxPrice) } });
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('date');
  }
  
  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  query = query.skip(startIndex).limit(limit);
  
  // Populate with artist details
  query = query.populate('artists', 'name genre profileImage');
  
  // Execute query
  const events = await query;
  
  // Pagination result
  const total = await Event.countDocuments();
  
  res.status(200).json({
    success: true,
    count: events.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email')
    .populate('artists', 'name genre profileImage bio pricePerHour');
  
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found',
    });
  }
  
  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  let event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found',
    });
  }

  const organizer = event.organizer as { _id: string };
  
  // Make sure user is the event organizer or an admin
  if (organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this event',
    });
  }
  
  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found',
    });
  }

  const organizer = event.organizer as { _id: string };
  
  // Make sure user is the event organizer or an admin
  if (organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this event',
    });
  }
  
  await event.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});
