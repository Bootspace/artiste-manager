"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(config_1.default.mongoUri);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`Error: ${error.message}`);
        }
        else {
            logger_1.default.error('Unknown error occurred connecting to MongoDB');
        }
        process.exit(1);
    }
};
exports.default = connectDB;
