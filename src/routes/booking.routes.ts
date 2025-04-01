import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  updateBooking, 
  deleteBooking 
} from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;