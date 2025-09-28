const mongoose = require('mongoose');
const { logger } = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Connection options for better stability
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - attempting reconnection...');
      // Auto-reconnect logic
      setTimeout(() => {
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    // Retry connection after 5 seconds
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB;
