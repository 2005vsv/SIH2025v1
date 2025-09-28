const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');
const User = require('../models/User');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query parameter
    const token = req.headers.authorization?.split(' ')[1] || 
                  req.cookies?.token ||
                  req.query?.token;

    if (!token) {
      logger.warn('Auth failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    // Verify user exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn(`Auth failed: User not found - ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (!user.isActive) {
      logger.warn(`Auth failed: Inactive user - ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Your account is currently inactive',
      });
    }

    console.log('DEBUG AUTH - User authenticated:', {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    });

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