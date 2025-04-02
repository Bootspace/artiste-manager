"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./config/db"));
const config_1 = __importDefault(require("./config/config"));
const error_1 = require("./middleware/error");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const artist_routes_1 = __importDefault(require("./routes/artist.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const logger_1 = __importDefault(require("./utils/logger"));
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Body parser
app.use(express_1.default.json());
// Logging middleware
if (config_1.default.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Security middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Routes
app.use('/api/users', user_routes_1.default);
app.use('/api/artists', artist_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});
// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Not found - ${req.originalUrl}`,
    });
});
// Error handling middleware
app.use(error_1.errorHandler);
const PORT = config_1.default.port;
app.listen(PORT, () => {
    logger_1.default.info(`Server running in ${config_1.default.nodeEnv} mode on port ${PORT}`);
});
exports.default = app;
