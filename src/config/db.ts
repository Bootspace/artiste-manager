// src/config/db.ts
import mongoose from 'mongoose';
import config from './config';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoProd);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error('Unknown error occurred connecting to MongoDB');
    }
    process.exit(1);
  }
};

export default connectDB;
