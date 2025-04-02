"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Booking_1 = __importDefault(require("../models/Booking"));
const Artist_1 = __importDefault(require("../models/Artist"));
const Event_1 = __importDefault(require("../models/Event"));
// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { artist: artistId, event: eventId, bookingDate, startTime, endTime, hours, specialRequests } = req.body;
    // Check if artist exists
    const artist = await Artist_1.default.findById(artistId);
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
    const event = await Event_1.default.findById(eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Event not found',
        });
    }
    // Calculate total amount
    const totalAmount = hours * artist.pricePerHour;
    // Create booking
    const booking = await Booking_1.default.create({
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
exports.getBookings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let query;
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
        query = Booking_1.default.find({ user: req.user.id });
    }
    else {
        query = Booking_1.default.find({});
    }
    // Filter by status
    if (req.query.status) {
        query = query.find({ status: req.query.status });
    }
    // Filter by date range
    if (req.query.startDate) {
        query = query.find({
            bookingDate: { $gte: new Date(req.query.startDate) }
        });
    }
    if (req.query.endDate) {
        query = query.find({
            bookingDate: { $lte: new Date(req.query.endDate) }
        });
    }
    // Filter by payment status
    if (req.query.paymentStatus) {
        query = query.find({ paymentStatus: req.query.paymentStatus });
    }
    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else {
        query = query.sort('-createdAt');
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    query = query.skip(startIndex).limit(limit)
        .populate('artist', 'name genre profileImage')
        .populate('event', 'title venue date startTime endTime')
        .populate('user', 'name email');
    // Execute query
    const bookings = await query;
    // Pagination result
    const total = await Booking_1.default.countDocuments();
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
exports.getBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const booking = await Booking_1.default.findById(req.params.id)
        .populate('artist', 'name genre profileImage pricePerHour')
        .populate('event', 'title venue date startTime endTime')
        .populate("user", "name email");
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
exports.updateBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let booking = await Booking_1.default.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: 'Booking not found',
        });
    }
    const user = booking.user;
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
    const updateData = {};
    if (status)
        updateData.status = status;
    if (paymentStatus)
        updateData.paymentStatus = paymentStatus;
    booking = await Booking_1.default.findByIdAndUpdate(req.params.id, updateData, {
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
exports.deleteBooking = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const booking = await Booking_1.default.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: 'Booking not found',
        });
    }
    const user = booking.user;
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
