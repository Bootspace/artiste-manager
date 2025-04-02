"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log to console for dev
    logger_1.default.error(err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        return res.status(404).json({
            success: false,
            error: message,
        });
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : '';
        return res.status(400).json({
            success: false,
            error: message,
            field,
        });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err).map((val) => val.message);
        return res.status(400).json({
            success: false,
            error: message,
        });
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};
exports.errorHandler = errorHandler;
