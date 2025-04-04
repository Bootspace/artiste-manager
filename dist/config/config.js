"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = ["MONGO_URI_PROD", "JWT_SECRET", "JWT_EXPIRES_IN"];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
exports.default = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI,
    mongoProd: process.env.MONGO_URI_PROD,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};
