"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addArtistReview = exports.deleteArtist = exports.updateArtist = exports.getArtist = exports.getArtists = exports.createArtist = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Artist_1 = __importDefault(require("../models/Artist"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Create artist profile
// @route   POST /api/artists
// @access  Private
exports.createArtist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    req.body.user = req.user.id;
    // Check if artist profile already exists for this user
    const existingArtist = await Artist_1.default.findOne({ user: req.user.id });
    if (existingArtist) {
        return res.status(400).json({
            success: false,
            error: 'You already have an artist profile',
        });
    }
    const artist = await Artist_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: artist,
    });
});
// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
exports.getArtists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Build query
    // Filter
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);
    // Search
    let query = Artist_1.default.find({});
    if (req.query.search) {
        query = Artist_1.default.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { genre: { $regex: req.query.search, $options: 'i' } },
                { bio: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    // Genre filter
    if (req.query.genre) {
        query = query.find({ genre: { $in: [req.query.genre] } });
    }
    // Rating filter
    if (req.query.minRating) {
        query = query.find({ rating: { $gte: Number(req.query.minRating) } });
    }
    // Availability filter
    if (req.query.isAvailable) {
        query = query.find({ isAvailable: req.query.isAvailable === 'true' });
    }
    // Price range filter
    if (req.query.minPrice && req.query.maxPrice) {
        query = query.find({
            pricePerHour: {
                $gte: Number(req.query.minPrice),
                $lte: Number(req.query.maxPrice)
            }
        });
    }
    else if (req.query.minPrice) {
        query = query.find({ pricePerHour: { $gte: Number(req.query.minPrice) } });
    }
    else if (req.query.maxPrice) {
        query = query.find({ pricePerHour: { $lte: Number(req.query.maxPrice) } });
    }
    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else {
        query = query.sort('-rating');
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    query = query.skip(startIndex).limit(limit);
    // Execute query
    const artists = await query;
    // Pagination result
    const total = await Artist_1.default.countDocuments();
    res.status(200).json({
        success: true,
        count: artists.length,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        },
        data: artists,
    });
});
// @desc    Get single artist
// @route   GET /api/artists/:id
// @access  Public
exports.getArtist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const artist = await Artist_1.default.findById(req.params.id).populate('reviews.user', 'name');
    if (!artist) {
        return res.status(404).json({
            success: false,
            error: 'Artist not found',
        });
    }
    res.status(200).json({
        success: true,
        data: artist,
    });
});
// @desc    Update artist profile
// @route   PUT /api/artists/:id
// @access  Private
exports.updateArtist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let artist = await Artist_1.default.findById(req.params.id);
    if (!artist) {
        return res.status(404).json({
            success: false,
            error: 'Artist not found',
        });
    }
    const user = artist.user;
    // Make sure user is the artist owner or an admin
    if (user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this artist profile',
        });
    }
    artist = await Artist_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: artist,
    });
});
// @desc    Delete artist profile
// @route   DELETE /api/artists/:id
// @access  Private
exports.deleteArtist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const artist = await Artist_1.default.findById(req.params.id);
    if (!artist) {
        return res.status(404).json({
            success: false,
            error: 'Artist not found',
        });
    }
    const user = artist.user;
    // Make sure user is the artist owner or an admin
    if (user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to delete this artist profile',
        });
    }
    await artist.deleteOne();
    res.status(200).json({
        success: true,
        data: {},
    });
});
// @desc    Add review to artist
// @route   POST /api/artists/:id/reviews
// @access  Private
exports.addArtistReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { text, rating } = req.body;
    const artist = await Artist_1.default.findById(req.params.id);
    if (!artist) {
        return res.status(404).json({
            success: false,
            error: 'Artist not found',
        });
    }
    // Check if user already reviewed
    const alreadyReviewed = artist.reviews.find((review) => {
        const reviewUserId = review.user instanceof mongoose_1.default.Types.ObjectId
            ? review.user.toString()
            : review.user;
        return reviewUserId === req.user.id;
    });
    if (alreadyReviewed) {
        return res.status(400).json({
            success: false,
            error: 'Artist already reviewed',
        });
    }
    // Add review
    const review = {
        user: req.user.id,
        text,
        rating: Number(rating),
        date: new Date(),
    };
    artist.reviews.push(review);
    // Update artist rating
    artist.rating =
        artist.reviews.reduce((acc, item) => item.rating + acc, 0) /
            artist.reviews.length;
    await artist.save();
    res.status(201).json({
        success: true,
        data: artist,
    });
});
