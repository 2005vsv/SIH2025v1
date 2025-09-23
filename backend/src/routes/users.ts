import { Router } from 'express';
import * as userController from '../controllers/userController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
import { validateRequest } from '../middleware/validateRequest';
import { userValidation } from '../validators/userValidation';

const router = Router();

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

export default router;