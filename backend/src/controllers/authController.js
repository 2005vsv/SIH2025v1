const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');
const User = require('../models/User');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'admin', 'faculty').default('student'),
  studentId: Joi.string().when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  profile: Joi.object({
    phone: Joi.string().optional(),
    department: Joi.string().optional(),
    semester: Joi.number().min(1).max(8).optional(),
    admissionYear: Joi.number().min(1990).max(new Date().getFullYear()).optional(),
  }).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Helper function to generate tokens
const generateTokens = (user) => {
  if (!user || !user._id) {
    throw new Error('Invalid user data for token generation');
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    name: user.name
  };

  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  try {
    const accessToken = jwt.sign(payload, jwtSecret, { 
      expiresIn: '24h'
    });
    
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, { 
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error:', error);
    throw new Error('Failed to generate authentication tokens');
  }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    console.log('DEBUG REGISTER - Request body:', req.body);
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      res.status(400).json(response);
      return;
    }

    const { name, email, password, role, studentId, profile } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response = {
        success: false,
        message: 'User already exists with this email',
      };
      res.status(400).json(response);
      return;
    }

    // Check if studentId already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        const response = {
          success: false,
          message: 'Student ID already exists',
        };
        res.status(400).json(response);
        return;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      profile,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info(`User registered: ${email}`);

    const response = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          profile: user.profile,
        },
        accessToken,
        refreshToken,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    console.log('DEBUG LOGIN - Request body:', req.body);
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user and include password and login attempt fields
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +isActive');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Debug: Log user status
    console.log('User found:', {
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      hasIsActive: user.hasOwnProperty('isActive'),
      userKeys: Object.keys(user.toObject())
    });

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    try {
      // This will check if account is locked and handle login attempts
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Get fresh user data to check updated login attempts
        const updatedUser = await User.findOne({ email }).select('loginAttempts lockUntil');
        const remainingAttempts = 5 - (updatedUser.loginAttempts || 0);
        return res.status(401).json({
          success: false,
          message: updatedUser.lockUntil && updatedUser.lockUntil > Date.now() ?
            'Account is temporarily locked. Please try again later.' :
            `Invalid credentials. ${remainingAttempts} login attempts remaining.`,
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      logger.info(`User logged in: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            profile: user.profile,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      if (error.message.includes('Account is temporarily locked')) {
        return res.status(423).json({
          success: false,
          message: error.message,
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      res.status(400).json(response);
      return;
    }

    const { refreshToken } = value;

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key');
    } catch (err) {
      logger.error('Refresh token error:', err);
      const response = {
        success: false,
        message: 'Invalid refresh token',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      const response = {
        success: false,
        message: 'User no longer exists or is inactive',
      };
      res.status(401).json(response);
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    const response = {
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Refresh token error:', error);
    const response = {
      success: false,
      message: 'Invalid refresh token',
    };
    res.status(401).json(response);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user && req.user.id);

    if (!user) {
      const response = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    // Debug: Log user profile data
    console.log('getProfile - User data:', {
      id: user._id,
      email: user.email,
      cgpa: user.profile?.cgpa,
      sgpa: user.profile?.sgpa,
      profile: user.profile
    });

    const response = {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          profile: user.profile,
          gamification: user.gamification,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};