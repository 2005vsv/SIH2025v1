import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin' | 'faculty';
    name: string;
  };
}

export const roleCheck = (requiredRole: 'admin' | 'student' | 'faculty') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during role check',
      });
    }
  };
};

// Allow access for admin or specific role
export const roleCheckOr = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (allowedRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(' or ')}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during role check',
      });
    }
  };
};

// Flexible role check that accepts single role or array
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return roleCheckOr(...allowedRoles);
};

// Check if user owns the resource or is admin
export const ownerOrAdmin = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const resourceUserId = req.params[userIdParam];
      
      if (req.user.role === 'admin' || req.user.id === resourceUserId) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during ownership check',
      });
    }
  };
};