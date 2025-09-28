const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

global.io = io;

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//   message: 'Too many requests from this IP, please try again later.'
// });

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use('/api/', limiter); // DISABLED FOR DEVELOPMENT

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  // Drop bad indexes
  try {
    console.log('Attempting to drop index code_1 on exams');
    const result = await mongoose.connection.db.collection('exams').dropIndex('code_1');
    console.log('Dropped index code_1 on exams:', result);
  } catch (err) {
    console.log('Index code_1 not found or already dropped:', err.message);
  }

  // Drop TTL indexes on users collection that might be deleting users
  try {
    console.log('Checking for TTL indexes on users collection');
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Current indexes on users:', indexes.map(idx => ({ name: idx.name, key: idx.key, expireAfterSeconds: idx.expireAfterSeconds })));
    for (const index of indexes) {
      if (index.name.includes('resetPasswordExpires') && index.expireAfterSeconds) {
        console.log('Found TTL index on users.resetPasswordExpires, dropping it');
        await mongoose.connection.db.collection('users').dropIndex(index.name);
        console.log('Dropped TTL index:', index.name);
      }
    }
  } catch (err) {
    console.log('Error checking/dropping TTL indexes:', err.message);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));


// Import and mount API routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const courseRoutes = require('./src/routes/courses');
const examRoutes = require('./src/routes/exams');
const gradeRoutes = require('./src/routes/grades');
const semesterRoutes = require('./src/routes/semesters');
const feeRoutes = require('./src/routes/fees');
const libraryRoutes = require('./src/routes/library');
const hostelRoutes = require('./src/routes/hostel');
const placementRoutes = require('./src/routes/placements');
const notificationRoutes = require('./src/routes/notifications');
const gamificationRoutes = require('./src/routes/gamification');
const analyticsRoutes = require('./src/routes/analytics');
const certificateRoutes = require('./src/routes/certificates');
const academicReportRoutes = require('./src/routes/academicReports');
const healthRoutes = require('./src/routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/academic-reports', academicReportRoutes);
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SIH 2025 Backend API', 
    status: 'Running',
    environment: process.env.NODE_ENV 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);

  // Drop problematic exams collection after server starts
  setTimeout(async () => {
    try {
      await mongoose.connection.db.collection('exams').drop();
      console.log('Dropped exams collection to remove bad indexes');
    } catch (err) {
      console.log('Drop exams collection error:', err.message);
    }
  }, 2000);
});

module.exports = app;
 
