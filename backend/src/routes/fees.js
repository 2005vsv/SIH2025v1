const express = require('express');
const {
    createFee,
    deleteFee,
    getFeeById,
    getFees,
    getFeeSummary,
    getPaymentHistory,
    getPaymentReceipt,
    makePayment,
    processRefund,
    getPaymentGatewayConfig,
    updateFee,
    createPaymentOrder,
    verifyPayment,
    bulkCreateFees,
    applyDiscountOrWaiver,
    getFeeReports,
    exportFeesToCSV,
    exportFeesToExcel,
} = require('../controllers/feeController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validateRequest');
const { createFeeSchema, makePaymentSchema, updateFeeSchema, bulkCreateFeesSchema, applyDiscountWaiverSchema } = require('../validators/feeValidation');
const { paymentLimiter } = require('../middleware/security');

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
                _id:
                    type: string
                    description: The auto-generated id of the fee
                userId:
                    type: string
                    description: The user ID this fee belongs to
                feeType:
                    type: string
                    enum: [tuition, hostel, library, examination, other]
                    description: Type of fee
                amount:
                    type: number
                    description: Fee amount
                description:
                    type: string
                    description: Fee description
                dueDate:
                    type: string
                    format: date
                    description: Fee due date
                status:
                    type: string
                    enum: [pending, paid, overdue]
                    description: Payment status
                paidAt:
                    type: string
                    format: date-time
                    description: Payment date
                paymentMethod:
                    type: string
                    description: Payment method used
                transactionId:
                    type: string
                    description: Transaction ID
                createdAt:
                    type: string
                    format: date-time
                updatedAt:
                    type: string
                    format: date-time
 */

// Get all fees
router.get('/', auth, getFees);

// Get fee summary
router.get('/summary', auth, getFeeSummary);

// Get payment history
router.get('/payments', auth, getPaymentHistory);

// Get fee by ID
router.get('/:id', auth, getFeeById);

// Create fee (Admin only)
router.post('/', auth, requireRole('admin'), validateRequest(createFeeSchema), createFee);

// Update fee (Admin only)
router.put('/:id', auth, requireRole('admin'), validateRequest(updateFeeSchema), updateFee);

// Delete fee (Admin only)
router.delete('/:id', auth, requireRole('admin'), deleteFee);

// Create payment order
router.post('/payment-order', auth, paymentLimiter, createPaymentOrder);

// Verify payment
router.post('/verify-payment', auth, paymentLimiter, verifyPayment);

// Make payment for fee
router.post('/:id/pay', auth, paymentLimiter, validateRequest(makePaymentSchema), makePayment);

// Get payment receipt
router.get('/payments/:id/receipt', auth, getPaymentReceipt);

// Process refund (Admin only)
router.post('/payments/:id/refund', auth, requireRole('admin'), processRefund);

// Get payment gateway configuration
router.get('/gateway/config', auth, getPaymentGatewayConfig);

// Bulk operations (Admin only)
router.post('/bulk', auth, requireRole('admin'), validateRequest(bulkCreateFeesSchema), bulkCreateFees);

// Apply discount or waiver (Admin only)
router.post('/:id/discount-waiver', auth, requireRole('admin'), validateRequest(applyDiscountWaiverSchema), applyDiscountOrWaiver);

// Reports and export
router.get('/reports', auth, requireRole('admin'), getFeeReports);
router.get('/export/csv', auth, requireRole('admin'), exportFeesToCSV);
router.get('/export/excel', auth, requireRole('admin'), exportFeesToExcel);

module.exports = router;
