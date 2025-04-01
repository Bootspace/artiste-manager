import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  updateUserProfile 
} from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUserProfile);

export default router;