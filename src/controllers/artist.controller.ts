import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Artist from '../models/Artist';
import { IReview } from '../types';
import mongoose from 'mongoose';

// @desc    Create artist profile
// @route   POST /api/artists
// @access  Private
export const createArtist = asyncHandler(async (req: Request, res: Response) => {
  req.body.user = req.user.id;
  
  // Check if artist profile already exists for this user
  const existingArtist = await Artist.findOne({ user: req.user.id });
  
  if (existingArtist) {
    return res.status(400).json({
      success: false,
      error: 'You already have an artist profile',
    });
  }
  
  const artist = await Artist.create(req.body);
  
  res.status(201).json({
    success: true,
    data: artist,
  });
});

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
export const getArtists = asyncHandler(async (req: Request, res: Response) => {
  // Build query
  // Filter
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);
  
  // Search
  let query = Artist.find({});
  if (req.query.search) {
    query = Artist.find({
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
  } else if (req.query.minPrice) {
    query = query.find({ pricePerHour: { $gte: Number(req.query.minPrice) } });
  } else if (req.query.maxPrice) {
    query = query.find({ pricePerHour: { $lte: Number(req.query.maxPrice) } });
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-rating');
  }
  
  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  query = query.skip(startIndex).limit(limit);
  
  // Execute query
  const artists = await query;
  
  // Pagination result
  const total = await Artist.countDocuments();
  
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
export const getArtist = asyncHandler(async (req: Request, res: Response) => {
  const artist = await Artist.findById(req.params.id).populate('reviews.user', 'name');
  
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
export const updateArtist = asyncHandler(async (req: Request, res: Response) => {
  let artist = await Artist.findById(req.params.id);
  
  if (!artist) {
    return res.status(404).json({
      success: false,
      error: 'Artist not found',
    });
  }

  const user = artist.user as { _id: string };
  
  // Make sure user is the artist owner or an admin
  if (user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this artist profile',
    });
  }
  
  artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
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
export const deleteArtist = asyncHandler(async (req: Request, res: Response) => {
  const artist = await Artist.findById(req.params.id);
  
  if (!artist) {
    return res.status(404).json({
      success: false,
      error: 'Artist not found',
    });
  }

  const user = artist.user as { _id: string };
  
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
  export const addArtistReview = asyncHandler(async (req: Request, res: Response) => {
    const { text, rating } = req.body;
    
    const artist = await Artist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found',
      });
    }
    
    // Check if user already reviewed
    const alreadyReviewed = (artist.reviews as IReview[]).find(
      (review) => {
        const reviewUserId = review.user instanceof mongoose.Types.ObjectId
          ? review.user.toString()
          : review.user;
        return reviewUserId === req.user.id;
      }
    );
    
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
  