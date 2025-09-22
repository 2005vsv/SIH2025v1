import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import User from '../models/User';
import { ApiResponse, AuthenticatedRequest, JWTPayload } from '../types';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        message: 'No token provided, authorization denied',
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    if (!process.env.JWT_SECRET) {
      logger.warn('JWT_SECRET is not defined, using fallback secret');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'User no longer exists or is inactive',
      };
      res.status(401).json(response);
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Token is not valid',
    };
    res.status(401).json(response);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authenticated',
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        message: 'User not authorized to access this route',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};