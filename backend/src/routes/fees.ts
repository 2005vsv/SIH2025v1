import express from 'express';
import {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  makePayment,
  getFeeSummary,
} from '../controllers/feeController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
import { validateRequest } from '../middleware/validateRequest';
import { createFeeSchema, updateFeeSchema, makePaymentSchema } from '../validators/feeValidation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Fee:
 *       type: object
 *       required:
 *         - userId
 *         - feeType
 *         - amount
 *         - description
 *         - dueDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the fee
 *         userId:
 *           type: string
 *           description: The user ID this fee belongs to
 *         feeType:
 *           type: string
 *           enum: [tuition, hostel, library, examination, other]
 *           description: Type of fee
 *         amount:
 *           type: number
 *           description: Fee amount
 *         description:
 *           type: string
 *           description: Fee description
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Fee due date
 *         status:
 *           type: string
 *           enum: [pending, paid, overdue]
 *           description: Payment status
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Payment date
 *         paymentMethod:
 *           type: string
 *           description: Payment method used
 *         transactionId:
 *           type: string
 *           description: Transaction ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Get all fees
router.get('/', auth, getFees);

// Get fee summary
router.get('/summary', auth, getFeeSummary);

// Get fee by ID
router.get('/:id', auth, getFeeById);

// Create fee (Admin only)
router.post('/', auth, requireRole('admin'), validateRequest(createFeeSchema), createFee);

// Update fee (Admin only)
router.put('/:id', auth, requireRole('admin'), validateRequest(updateFeeSchema), updateFee);

// Delete fee (Admin only)
router.delete('/:id', auth, requireRole('admin'), deleteFee);

// Make payment for fee
router.post('/:id/pay', auth, validateRequest(makePaymentSchema), makePayment);

export default router;