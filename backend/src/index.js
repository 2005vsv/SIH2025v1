const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
// const rateLimit = require('express-rate-limit'); // Disabled for development
const helmet = require('helmet');
// const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const { logger } = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Import routes
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const certificatesRoutes = require('./routes/certificates');
const chatbotRoutes = require('./routes/chatbot');
const examsRoutes = require('./routes/exams');
const feesRoutes = require('./routes/fees');
const gamificationRoutes = require('./routes/gamification');
const hostelRoutes = require('./routes/hostel');
const libraryRoutes = require('./routes/library');
const notificationsRoutes = require('./routes/notifications');
const placementsRoutes = require('./routes/placements');
const systemRoutes = require('./routes/system');
const usersRoutes = require('./routes/users');
const webhooksRoutes = require('./routes/webhooks');
// const uploadsRoutes = require('./routes/uploads');
// const healthRoutes = require('./routes/health');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Compression middleware for better performance
app.use(compression());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:19006', // Expo default port
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
}));

// Morgan logging for HTTP requests
if (process.env.NODE_ENV !== 'test') {
  // app.use(morgan('combined', {
  //   stream: {
  //     write: (message) => logger.http(message.trim())
  //   }
  // }));
}

// Rate limiting - COMPLETELY DISABLED FOR DEVELOPMENT
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Rate limiting DISABLED for development');

// Development bypass middleware - remove rate limit headers
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Remove any rate limit headers
    res.removeHeader('X-RateLimit-Limit');
    res.removeHeader('X-RateLimit-Remaining');
    res.removeHeader('X-RateLimit-Reset');
    res.removeHeader('Retry-After');
    next();
  });
}

// Body parser middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb'
}));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint (before API docs for quick access)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
    }
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: false,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { display: none }
    .swagger-ui .information-container { margin: 20px 0 }
  `,
  customSiteTitle: 'Student Portal API Documentation',
  customfavIcon: '/favicon.ico'
}));

// API Documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Portal API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/system', systemRoutes);
// app.use('/api/uploads', uploadsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/interviews', require('./routes/interviews'));
// app.use('/api/health', healthRoutes);

// 404 handler for API routes
app.use('/api/*', notFound);

// Serve React app in production (if built)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Global 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`💊 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app; 
