import express from 'express';
import { 
  createArtist, 
  getArtists, 
  getArtist, 
  updateArtist, 
  deleteArtist, 
  addArtistReview 
} from '../controllers/artist.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getArtists)
  .post(protect, createArtist);

router.route('/:id')
  .get(getArtist)
  .put(protect, updateArtist)
  .delete(protect, deleteArtist);

router.route('/:id/reviews')
  .post(protect, addArtistReview);

export default router;