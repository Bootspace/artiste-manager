"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
// Generate JWT
const generateToken = (_id) => {
    const secret = config_1.default.jwtSecret;
    const options = {
        expiresIn: config_1.default.jwtExpiresIn,
    };
    return jsonwebtoken_1.default.sign({ id: _id }, secret, options);
};
// @desc    Register user
// @route   POST /api/users
// @access  Public
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    // Check if user exists
    const userExists = await User_1.default.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, error: 'User already exists' });
    }
    // Create user
    const user = await User_1.default.create({
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
    }
    else {
        res.status(400).json({ success: false, error: 'Invalid user data' });
    }
});
// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Check for user
    const user = await User_1.default.findOne({ email }).select('+password');
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
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user,
    });
});
// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email } = req.body;
    const user = await User_1.default.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (name)
        user.name = name;
    if (email)
        user.email = email;
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
