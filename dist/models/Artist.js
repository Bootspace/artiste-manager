"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const artistSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for calculating average rating
artistSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0)
        return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return sum / this.reviews.length;
});
exports.default = mongoose_1.default.model('Artist', artistSchema);
