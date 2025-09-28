const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
// const rateLimit = require('express-rate-limit'); // Disabled for development
const helmet = require('helmet');
// const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
// const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const { logger } = require('./config/logger');
// const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const notificationService = require('./services/notificationService');
const {
  dataSanitization,
  xssProtection,
  preventParamPollution,
  requestSizeLimit,
  sqlInjectionProtection,
  securityHeaders,
  securityLogger,
  apiLimiter,
  authLimiter,
  paymentLimiter
} = require('./middleware/security');

// Import routes
const academicReportsRoutes = require('./routes/academicReports');
const analyticsRoutes = require('./routes/analytics');
const assignmentsRoutes = require('./routes/assignments');
const authRoutes = require('./routes/auth');
const certificatesRoutes = require('./routes/certificates');
const chatbotRoutes = require('./routes/chatbot');
const coursesRoutes = require('./routes/courses');
const examsRoutes = require('./routes/exams');
const feesRoutes = require('./routes/fees');
const gamificationRoutes = require('./routes/gamification');
const gradesRoutes = require('./routes/grades');
const hostelRoutes = require('./routes/hostel');
const libraryRoutes = require('./routes/library');
const notificationsRoutes = require('./routes/notifications');
const placementsRoutes = require('./routes/placements');
const semestersRoutes = require('./routes/semesters');
const systemRoutes = require('./routes/system');
const usersRoutes = require('./routes/users');
const webhooksRoutes = require('./routes/webhooks');
// const uploadsRoutes = require('./routes/uploads');
// const healthRoutes = require('./routes/health');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:19006',
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
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

// Security middleware
app.use(securityHeaders);
app.use(securityLogger);

// Data sanitization
app.use(dataSanitization);
app.use(xssProtection);
app.use(preventParamPollution);

// Request size limiting
app.use(requestSizeLimit);

// SQL injection protection
app.use(sqlInjectionProtection);

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
    success: true,
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

// API Documentation - DISABLED DUE TO YAML ERRORS
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   explorer: false,
//   customCss: `
//     .swagger-ui .topbar { display: none }
//     .swagger-ui .scheme-container { display: none }
//     .swagger-ui .information-container { margin: 20px 0 }
//   `,
//   customSiteTitle: 'Student Portal API Documentation',
//   customfavIcon: '/favicon.ico'
// }));

// API Documentation JSON endpoint - DISABLED DUE TO YAML ERRORS
// app.get('/api-docs.json', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send(swaggerSpec);
// });

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
app.use('/api/academic-reports', academicReportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/semesters', semestersRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/webhooks', webhooksRoutes);
// app.use('/api/uploads', uploadsRoutes);
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available globally for controllers
global.io = io;

// Initialize notification cron jobs
function initializeNotificationCronJobs() {
  // Send due date reminders daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily due date reminder job');
    try {
      await notificationService.sendDueDateReminders();
    } catch (error) {
      logger.error('Error in due date reminder job:', error);
    }
  });

  // Send overdue notifications daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    logger.info('Running daily overdue notification job');
    try {
      await notificationService.sendOverdueNotifications();
    } catch (error) {
      logger.error('Error in overdue notification job:', error);
    }
  });

  // Send weekly summary on Mondays at 8 AM
  cron.schedule('0 8 * * 1', async () => {
    logger.info('Running weekly fee summary job');
    try {
      // Could add weekly summary notifications here
    } catch (error) {
      logger.error('Error in weekly summary job:', error);
    }
  });

  logger.info('Notification cron jobs initialized');
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`💊 Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`🔌 WebSocket server ready`);

  // Initialize notification cron jobs
  initializeNotificationCronJobs();
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
