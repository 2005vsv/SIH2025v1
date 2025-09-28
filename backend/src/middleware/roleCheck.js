const express = require("express");

// Remove TypeScript syntax for JS compatibility
// If you want to use TypeScript, use .ts extension and proper imports

const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    try {
      console.log('DEBUG ROLE CHECK:', {
        requiredRole,
        userRole: req.user?.role,
        userId: req.user?.id,
        userEmail: req.user?.email
      });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Handle both single role and array of roles
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      console.log('DEBUG ROLE CHECK - Allowed roles:', allowedRoles);
      console.log('DEBUG ROLE CHECK - User role:', req.user.role);

      if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(' or ')}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during role check',
      });
    }
  };
};

// Allow access for admin or specific role
const roleCheckOr = (...allowedRoles) => {
  return (req, res, next) => {
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
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return roleCheckOr(...allowedRoles);
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
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

module.exports = {
  roleCheck,
  roleCheckOr,
  requireRole,
  ownerOrAdmin,
};