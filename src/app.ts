import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import connectDB from './config/db';
import config from './config/config';
import { errorHandler } from './middleware/error';
import userRoutes from './routes/user.routes';
import artistRoutes from './routes/artist.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import logger from './utils/logger';

// Connect to database
connectDB();

const app: Application = express();

// Body parser
app.use(express.json());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(cors());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: `Not found - ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;
