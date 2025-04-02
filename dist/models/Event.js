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
const eventSchema = new mongoose_1.Schema({
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for tickets remaining
eventSchema.virtual('ticketsRemaining').get(function () {
    return this.ticketsAvailable - this.ticketsSold;
});
// Index for searching events
eventSchema.index({ title: 'text', description: 'text' });
exports.default = mongoose_1.default.model('Event', eventSchema);
