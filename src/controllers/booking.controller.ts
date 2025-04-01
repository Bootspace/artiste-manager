import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Booking from '../models/Booking';
import Artist from '../models/Artist';
import Event from '../models/Event';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { artist: artistId, event: eventId, bookingDate, startTime, endTime, hours, specialRequests } = req.body;
  
  // Check if artist exists
  const artist = await Artist.findById(artistId);
  if (!artist) {
    return res.status(404).json({
      success: false,
      error: 'Artist not found',
    });
  }
  
  // Check if artist is available
  if (!artist.isAvailable) {
    return res.status(400).json({
      success: false,
      error: 'Artist is not available for booking',
    });
  }
  
  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found',
    });
  }
  
  // Calculate total amount
  const totalAmount = hours * artist.pricePerHour;
  
  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    artist: artistId,
    event: eventId,
    bookingDate,
    startTime,
    endTime,
    hours,
    totalAmount,
    specialRequests,
  });
  
  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  let query;
  
  // If user is not admin, only show their bookings
  if (req.user.role !== 'admin') {
    query = Booking.find({ user: req.user.id });
  } else {
    query = Booking.find({});
  }
  
  // Filter by status
  if (req.query.status) {
    query = query.find({ status: req.query.status });
  }
  
  // Filter by date range
  if (req.query.startDate) {
    query = query.find({ 
      bookingDate: { $gte: new Date(req.query.startDate as string) } 
    });
  }
  
  if (req.query.endDate) {
    query = query.find({ 
      bookingDate: { $lte: new Date(req.query.endDate as string) } 
    });
  }
  
  // Filter by payment status
  if (req.query.paymentStatus) {
    query = query.find({ paymentStatus: req.query.paymentStatus });
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  query = query.skip(startIndex).limit(limit)
    .populate('artist', 'name genre profileImage')
    .populate('event', 'title venue date startTime endTime')
    .populate('user', 'name email');
  
  // Execute query
  const bookings = await query;
  
  // Pagination result
  const total = await Booking.countDocuments();
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id)
    .populate('artist', 'name genre profileImage pricePerHour')
    .populate('event', 'title venue date startTime endTime')
    .populate<{ user: { _id: string; name: string; email: string } }>("user", "name email");

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
    });
  }
  
  // Make sure user is booking owner or admin
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this booking',
    });
  }
  
  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  let booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
    });
  }

  const user = booking.user as { _id: string };
  
  // Make sure user is booking owner or admin
  if (user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this booking',
    });
  }
  
  // Only allow status update
  const { status, paymentStatus } = req.body;
  
  // Create update object
  const updateData: { status?: string; paymentStatus?: string } = {};
  if (status) updateData.status = status;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  
  booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
    });
  }

  const user = booking.user as { _id: string };
  
  // Make sure user is booking owner or admin
  if (user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this booking',
    });
  }
  
  await booking.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});