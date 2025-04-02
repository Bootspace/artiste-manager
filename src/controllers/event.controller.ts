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

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('artists', 'name genre profileImage bio pricePerHour')
      .lean();

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
  } catch (error: any) {
    console.error('Error in getEvent:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'Unknown error occurred'
    });
  }
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


// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Build query
    // Filter
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Base query
    let query = Event.find({});
    let countQuery = Event.find({});
    
    // Search
    if (req.query.search) {
      const searchCondition = {
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { genre: { $regex: req.query.search, $options: 'i' } }
        ]
      };
      query = Event.find(searchCondition);
      countQuery = Event.find(searchCondition);
    }
    
    // Genre filter
    if (req.query.genre) {
      const genreCondition = { genre: { $in: [req.query.genre] } };
      query = query.find(genreCondition);
      countQuery = countQuery.find(genreCondition);
    }
    
    // Status filter
    if (req.query.status) {
      const statusCondition = { status: req.query.status };
      query = query.find(statusCondition);
      countQuery = countQuery.find(statusCondition);
    } else {
      // Default to only published events for public views
      const publishedCondition = { status: 'published' };
      query = query.find(publishedCondition);
      countQuery = countQuery.find(publishedCondition);
    }
    
    // Date filter
    if (req.query.startDate) {
      const startDateCondition = { date: { $gte: new Date(req.query.startDate as string) } };
      query = query.find(startDateCondition);
      countQuery = countQuery.find(startDateCondition);
    }
    
    if (req.query.endDate) {
      const endDateCondition = { date: { $lte: new Date(req.query.endDate as string) } };
      query = query.find(endDateCondition);
      countQuery = countQuery.find(endDateCondition);
    }
    
    // Price range filter
    if (req.query.minPrice && req.query.maxPrice) {
      const priceRangeCondition = {
        ticketPrice: {
          $gte: Number(req.query.minPrice),
          $lte: Number(req.query.maxPrice)
        }
      };
      query = query.find(priceRangeCondition);
      countQuery = countQuery.find(priceRangeCondition);
    } else if (req.query.minPrice) {
      const minPriceCondition = { ticketPrice: { $gte: Number(req.query.minPrice) } };
      query = query.find(minPriceCondition);
      countQuery = countQuery.find(minPriceCondition);
    } else if (req.query.maxPrice) {
      const maxPriceCondition = { ticketPrice: { $lte: Number(req.query.maxPrice) } };
      query = query.find(maxPriceCondition);
      countQuery = countQuery.find(maxPriceCondition);
    }
    
    // Get total count before applying pagination
    const total = await countQuery.countDocuments();
    
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
    
    // Execute query with defensive approach
    let events: any[];
    try {
      events = await Promise.resolve(query.lean().exec());
    } catch (findError) {
      console.error("Error during Event.find():", findError);
      throw findError;
    }
    
    // Ensure events is an array
    if (!Array.isArray(events)) {
      console.log(`Events is not an array: ${JSON.stringify(events)}`);
      events = [];
    }
    
    // Return response
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
  } catch (error: any) {
    console.error('Error in getEvents:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// //////////////////////DATE RANGE//////////////////
// GET http://localhost:3000/api/events?startDate=2025-01-01&endDate=2025-12-31
// GET http://localhost:3000/api/events?startDate=2025-04-01
// GET http://localhost:3000/api/events?endDate=2025-06-30


// //////////////////////GENRE//////////////////
// GET http://localhost:3000/api/events?genre=rock
// GET http://localhost:3000/api/events?genre=jazz
// GET http://localhost:3000/api/events?genre=electronic


// //////////////////////SEARCH//////////////////
// GET http://localhost:3000/api/events?search=concert
// GET http://localhost:3000/api/events?search=music
// GET http://localhost:3000/api/events?search=jazz


// ////////////////////////////COMBINED FILTERS////////////
// GET http://localhost:3000/api/events?genre=rock&status=published&sort=-date&page=1&limit=5
// GET http://localhost:3000/api/events?search=festival&startDate=2025-05-01&endDate=2025-09-30
// GET http://localhost:3000/api/events?minPrice=20&maxPrice=100&genre=jazz&sort=ticketPrice
// GET http://localhost:3000/api/events?status=published&sort=-date&limit=3


// ////////////////////////////PRICE RANGE////////////
// GET http://localhost:3000/api/events?minPrice=10&maxPrice=50
// GET http://localhost:3000/api/events?minPrice=100
// GET http://localhost:3000/api/events?maxPrice=25


// ////////////////////////////PAGINATION////////////
// GET http://localhost:3000/api/events?page=1&limit=10
// GET http://localhost:3000/api/events?page=2&limit=5
// GET http://localhost:3000/api/events?page=3&limit=20


// ////////////////////////////STATUS////////////
// GET http://localhost:3000/api/events?status=published
// GET http://localhost:3000/api/events?status=draft
// GET http://localhost:3000/api/events?status=cancelled
// GET http://localhost:3000/api/events?status=completed

// ////////////////////////////SORTING////////////
// GET http://localhost:3000/api/events?sort=date
// GET http://localhost:3000/api/events?sort=-date
// GET http://localhost:3000/api/events?sort=ticketPrice
// GET http://localhost:3000/api/events?sort=-ticketPrice
// GET http://localhost:3000/api/events?sort=title