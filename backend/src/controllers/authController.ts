import { NextFunction, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import User from '../models/User';
import { ApiResponse, AuthenticatedRequest } from '../types';

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'admin').default('student'),
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
const generateTokens = (user: any) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
  };

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';

  const accessToken = jwt.sign(payload, jwtSecret, { 
    expiresIn: '1h'
  });
  
  const refreshToken = jwt.sign(payload, jwtRefreshSecret, { 
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
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
      const response: ApiResponse = {
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
        const response: ApiResponse = {
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

    const response: ApiResponse = {
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
export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        message: error.details[0].message,
      };
      res.status(400).json(response);
      return;
    }

    const { email, password } = value;

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is deactivated',
      };
      res.status(401).json(response);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials',
      };
      res.status(401).json(response);
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info(`User logged in: ${email}`);

    const response: ApiResponse = {
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
    };

    res.status(200).json(response);
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
export const refresh = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        message: error.details[0].message,
      };
      res.status(400).json(response);
      return;
    }

    const { refreshToken } = value;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'User no longer exists or is inactive',
      };
      res.status(401).json(response);
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Refresh token error:', error);
    const response: ApiResponse = {
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
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
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