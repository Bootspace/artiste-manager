import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User';
import jwt, {Secret, SignOptions} from 'jsonwebtoken';
import config from '../config/config';

// Generate JWT
const generateToken = (_id: string): string => {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };

  return jwt.sign({ id: _id }, secret, options);
};


// @desc    Register user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

   const userId = user.id.toString();

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(userId),
      },
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid user data' });
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const userId = user.id.toString();


  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(userId),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (name) user.name = name;
  if (email) user.email = email;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});