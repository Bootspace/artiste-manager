import mongoose, { Schema } from 'mongoose';
import { IArtist } from '../types';

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const artistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide artist name'],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'Please provide at least one genre'],
    },
    bio: {
      type: String,
      required: [true, 'Please provide a bio'],
    },
    profileImage: {
      type: String,
      default: 'default-artist.jpg',
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide contact email'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide contact phone'],
    },
    socialLinks: {
      website: String,
      instagram: String,
      twitter: String,
      facebook: String,
      spotify: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    pricePerHour: {
      type: Number,
      required: [true, 'Please provide price per hour'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculating average rating
artistSchema.virtual('averageRating').get(function (this: IArtist) {
  if (this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / this.reviews.length;
});

export default mongoose.model<IArtist>('Artist', artistSchema);
