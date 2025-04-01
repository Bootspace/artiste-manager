import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IReview {
  user: IUser['_id'];
  text: string;
  rating: number;
  date: Date;
}

export interface IArtist extends Document {
  user: IUser['_id'];
  name: string;
  genre: string[];
  bio: string;
  profileImage: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    spotify?: string;
  };
  rating: number;
  reviews: IReview[];
  pricePerHour: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  organizer: IUser['_id'];
  title: string;
  description: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  date: Date;
  startTime: string;
  endTime: string;
  genre: string[];
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  artists: IArtist['_id'][];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  coverImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking extends Document {
  user: IUser['_id'];
  event: IEvent['_id'];
  artist: IArtist['_id'];
  bookingDate: Date;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests: string;
  createdAt: Date;
  updatedAt: Date;
}