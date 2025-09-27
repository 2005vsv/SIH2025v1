const { Router } = require('express');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validateRequest');
const { userValidation } = require('../validators/userValidation');

const router = Router();

// ...existing code...

// routes/users.js or similar

const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { logger } = require('../config/logger');

router.patch('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

  const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        password: hashedPassword,
        passwordChangedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    logger.info(`Password changed successfully for user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while changing password',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

  const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        password: hashedPassword,
        passwordChangedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    logger.info(`Password changed successfully for user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while changing password',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});



/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
*           type: string
 *         email:
*           type: string
 *         name:
*           type: string
 *         role:
*           type: string
 *           enum: [student, admin]
 *         isActive:
*           type: boolean
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, requireRole('admin'), userController.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, requireRole('admin'), validateRequest(userValidation.createUser), userController.createUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', auth, validateRequest(userValidation.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth, requireRole('admin'), userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, requireRole('admin'), validateRequest(userValidation.updateUser), userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, requireRole('admin'), userController.deleteUser);

/**
 * @swagger
 * /api/users/bulk/import:
 *   post:
 *     summary: Bulk import users from CSV (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk/import', auth, requireRole('admin'), userController.bulkImport);

/**
 * @swagger
 * /api/users/bulk/export:
 *   get:
 *     summary: Export users to CSV (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/bulk/export', auth, requireRole('admin'), userController.bulkExport);


// Password reset confirmation endpoint
router.post('/reset-password', userController.resetPassword);

// Admin-only registration endpoint
router.post('/register-admin', auth, requireRole('admin'), userController.registerAdmin);

// Admin-only password change endpoint
// Student password change endpoint
router.post('/change-password', auth, requireRole('student'), userController.changePassword);
router.post('/change-admin-password', auth, requireRole('admin'), userController.changeAdminPassword);

module.exports = router;