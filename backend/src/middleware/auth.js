const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');
const User = require('../models/User');

// Auth middleware
const auth = async (req, res, next) => {
  // Debug: log all headers to help diagnose missing Authorization header
  console.log('DEBUG AUTH HEADERS:', req.headers);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    if (!process.env.JWT_SECRET) {
      logger.warn('JWT_SECRET is not defined, using fallback secret');
    }

    const decoded = jwt.verify(token, jwtSecret);

    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists or is inactive',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'User not authorized to access this route',
      });
      return;
    }

    next();
  };
};

module.exports = { auth, authorize };