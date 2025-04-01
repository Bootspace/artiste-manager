import mongoose, { Schema } from 'mongoose';
import { IEvent } from '../types';

const eventSchema = new Schema(
  {
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    venue: {
      name: {
        type: String,
        required: [true, 'Please add venue name'],
      },
      address: {
        type: String,
        required: [true, 'Please add venue address'],
      },
      city: {
        type: String,
        required: [true, 'Please add venue city'],
      },
      state: {
        type: String,
        required: [true, 'Please add venue state'],
      },
      zipCode: {
        type: String,
        required: [true, 'Please add venue zip code'],
      },
      country: {
        type: String,
        required: [true, 'Please add venue country'],
      },
    },
    date: {
      type: Date,
      required: [true, 'Please add event date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please add start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please add end time'],
    },
    genre: {
      type: [String],
      required: [true, 'Please add at least one genre'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Please add ticket price'],
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Please add number of available tickets'],
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    artists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    coverImage: {
      type: String,
      default: 'default-event.jpg',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for tickets remaining
eventSchema.virtual('ticketsRemaining').get(function (this: IEvent) {
  return this.ticketsAvailable - this.ticketsSold;
});

// Index for searching events
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IEvent>('Event', eventSchema);
