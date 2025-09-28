const Fee = require('../models/Fee');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const paymentService = require('../services/paymentService');
const receiptGenerator = require('../utils/receiptGenerator');
const notificationService = require('../services/notificationService');

// Get all fees for current user (Student) or all fees (Admin)
exports.getFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, feeType } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    const query = {};

    // Students can only see their own fees
    if (!isAdmin) {
      query.userId = req.user && req.user.id;
    }

    if (status) query.status = status;
    if (feeType) query.feeType = feeType;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [],
    };

    const fees = await Fee.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Fee.countDocuments(query);

    res.json({
      success: true,
      data: {
        fees,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fees',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get fee by ID
exports.getFeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    const query = { _id: id };

    // Students can only see their own fees
    if (!isAdmin) {
      query.userId = req.user && req.user.id;
    }

    const fee = await Fee.findOne(query)
      .populate(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : []);

    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Create fee (Admin only)
exports.createFee = async (req, res) => {
  try {
    const { userId, ...feeData } = req.body;

    // Find user by studentId or email
    const user = await User.findOne({
      $or: [
        { studentId: userId },
        { email: userId }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Fees can only be created for students',
      });
    }

    const fee = new Fee({
      ...feeData,
      userId: user._id
    });

    await fee.save();

    await fee.populate([{ path: 'userId', select: 'name email studentId' }]);

    // Create notification for the student
    const notification = new Notification({
      userId: user._id,
      title: 'New Fee Assigned',
      message: `A new fee of ₹${fee.amount} for ${fee.description} has been assigned to you. Due date: ${new Date(fee.dueDate).toLocaleDateString()}.`,
      type: 'warning',
      category: 'fee',
      priority: 'high',
      actionUrl: '/student/fees',
      actionText: 'View Fee Details',
      data: {
        feeId: fee._id,
        amount: fee.amount,
        dueDate: fee.dueDate,
        feeType: fee.feeType
      },
      createdBy: req.user && req.user.id
    });

    const savedNotification = await notification.save();

    // Emit real-time notification via Socket.IO
    if (global.io) {
      global.io.to(`user_${user._id}`).emit('notification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        category: savedNotification.category,
        priority: savedNotification.priority,
        actionUrl: savedNotification.actionUrl,
        actionText: savedNotification.actionText,
        data: savedNotification.data,
        createdAt: savedNotification.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create fee',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update fee (Admin only)
exports.updateFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate([{ path: 'userId', select: 'name email studentId' }]);

    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Fee updated successfully',
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update fee',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete fee (Admin only)
exports.deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findByIdAndDelete(id);

    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Fee deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete fee',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Make payment for fee
exports.makePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount: paymentAmount,
      paymentMethod = 'online',
      transactionId,
      gateway = 'manual',
      gatewayResponse
    } = req.body;
    const userId = req.user && req.user.id;

    const fee = await Fee.findById(id);

    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }

    // Check if user can pay this fee
    if ((req.user && req.user.role !== 'admin') && fee.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only pay your own fees',
      });
      return;
    }

    if (fee.status === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Fee is already fully paid',
      });
      return;
    }

    // Calculate payment amount (remaining or specified)
    const remainingAmount = fee.amount - (fee.paidAmount || 0);
    const finalPaymentAmount = paymentAmount || remainingAmount;

    if (finalPaymentAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
      return;
    }

    if (finalPaymentAmount > remainingAmount) {
      res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance',
      });
      return;
    }

    // Generate transaction ID if not provided
    const finalTransactionId = transactionId || `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction record
    const transaction = new Transaction({
      userId: fee.userId,
      feeId: fee._id,
      amount: finalPaymentAmount,
      currency: fee.currency || 'INR',
      status: 'completed',
      paymentMethod,
      transactionId: finalTransactionId,
      gatewayTransactionId: gatewayResponse?.transactionId,
      gatewayResponse,
      description: `Payment for ${fee.description}`,
      metadata: {
        gateway,
        feeType: fee.feeType,
        dueDate: fee.dueDate,
      },
    });

    await transaction.save();

    // Update fee payment status
    const newPaidAmount = (fee.paidAmount || 0) + finalPaymentAmount;
    fee.paidAmount = newPaidAmount;
    fee.status = newPaidAmount >= fee.amount ? 'paid' : 'partial';
    fee.paidAt = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = finalTransactionId;

    await fee.save();

    // Send payment confirmation notification
    await notificationService.sendPaymentConfirmation(fee, transaction);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        fee,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get fee summary for dashboard
exports.getFeeSummary = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = req.user && req.user.id;

    let matchQuery = {};
    if (!isAdmin) {
      matchQuery.userId = userId;
    }

    const summary = await Fee.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const overdueFees = await Fee.countDocuments({
      ...matchQuery,
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() },
    });

    const upcomingFees = await Fee.countDocuments({
      ...matchQuery,
      status: 'pending',
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      data: {
        summary,
        overdueFees,
        upcomingFees,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee summary',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, fromDate, toDate } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    const query = { status: 'completed' };

    // Students can only see their own payment history
    if (!isAdmin) {
      const userFees = await Fee.find({ userId: req.user && req.user.id }).select('_id');
      const feeIds = userFees.map(fee => fee._id);
      query.feeId = { $in: feeIds };
    }

    if (status) query.status = status;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
    };

    const payments = await Transaction.find(query)
      .populate('feeId', 'feeType description amount')
      .populate('userId', 'name email studentId')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get payment receipt
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    const payment = await Transaction.findById(id)
      .populate('feeId', 'feeType description amount dueDate')
      .populate('userId', 'name email studentId profile.department');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Students can only access their own receipts
    if (!isAdmin && payment.userId._id.toString() !== (req.user && req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Generate receipt data for PDF
    const receiptData = {
      receiptNumber: `RCP-${payment._id}`,
      paymentDate: payment.createdAt,
      student: {
        name: payment.userId.name,
        email: payment.userId.email,
        studentId: payment.userId.studentId,
        department: payment.userId.profile?.department,
      },
      fee: {
        type: payment.feeId.feeType,
        description: payment.feeId.description,
        amount: payment.feeId.amount,
        dueDate: payment.feeId.dueDate,
      },
      payment: {
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        gatewayTransactionId: payment.gatewayTransactionId,
        status: payment.status,
        paidAt: payment.createdAt,
        currency: payment.currency,
        amount: payment.amount,
      },
    };

    // Generate PDF receipt
    const pdfBuffer = await receiptGenerator.generatePaymentReceipt(receiptData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receiptData.receiptNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

    // Update fee receiptGenerated flag
    await Fee.findByIdAndUpdate(payment.feeId._id, { receiptGenerated: true });

  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can process refunds',
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (!transaction.canRefund()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be refunded',
      });
    }

    const finalRefundAmount = refundAmount || transaction.amount;

    if (finalRefundAmount > transaction.netAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed net transaction amount',
      });
    }

    // Update transaction
    transaction.status = finalRefundAmount === transaction.amount ? 'refunded' : 'completed';
    transaction.refundAmount = (transaction.refundAmount || 0) + finalRefundAmount;
    transaction.refundReason = refundReason;
    transaction.refundedAt = new Date();

    await transaction.save();

    // Update fee status if fully refunded
    if (transaction.refundAmount === transaction.amount) {
      await Fee.findByIdAndUpdate(transaction.feeId, {
        status: 'pending',
        paidAt: null,
        paymentMethod: null,
        transactionId: null,
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { transaction },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Create payment order for gateway
exports.createPaymentOrder = async (req, res) => {
  try {
    const { feeId, gateway = 'razorpay' } = req.body;
    const userId = req.user && req.user.id;

    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    // Check if user can pay this fee
    if ((req.user && req.user.role !== 'admin') && fee.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay your own fees',
      });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Fee is already fully paid',
      });
    }

    const remainingAmount = fee.amount - (fee.paidAmount || 0);

    // Try to create payment order with specified gateway
    const orderResult = await paymentService.createPaymentOrder(
      gateway,
      remainingAmount,
      fee.currency || 'INR',
      `Payment for ${fee.description}`,
      {
        feeId: fee._id.toString(),
        userId: fee.userId.toString(),
        feeType: fee.feeType,
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/fees/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/fees/payment/cancel`,
      }
    );

    if (orderResult.success) {
      res.json({
        success: true,
        data: {
          order: orderResult.payment || orderResult.order || orderResult.paymentIntent,
          gateway,
          amount: remainingAmount,
          currency: fee.currency || 'INR',
        },
      });
    } else {
      // Fallback to manual payment
      res.json({
        success: true,
        data: {
          gateway: 'manual',
          amount: remainingAmount,
          currency: fee.currency || 'INR',
          message: `${gateway} not configured, use manual payment`,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Verify payment from gateway
exports.verifyPayment = async (req, res) => {
  try {
    const {
      feeId,
      gateway,
      orderId,
      paymentId,
      signature,
      amount
    } = req.body;
    const userId = req.user && req.user.id;

    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    // Check if user can pay this fee
    if ((req.user && req.user.role !== 'admin') && fee.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay your own fees',
      });
    }

    let isVerified = false;
    let gatewayResponse = {};

    if (gateway === 'manual') {
      // For manual payments, assume verified
      isVerified = true;
    } else {
      // Verify payment with the gateway
      const verificationResult = await paymentService.verifyPayment(gateway, {
        orderId,
        paymentId,
        signature,
        paymentIntentId: paymentId, // For Stripe
        payerId: req.body.payerId, // For PayPal
      });

      if (verificationResult.success) {
        isVerified = true;
        gatewayResponse = verificationResult.payment || verificationResult.paymentIntent || {};
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Process the payment
    const paymentAmount = amount || (fee.amount - (fee.paidAmount || 0));

    const finalPaymentAmount = Math.min(paymentAmount, fee.amount - (fee.paidAmount || 0));

    // Generate transaction ID
    const finalTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction record
    const transaction = new Transaction({
      userId: fee.userId,
      feeId: fee._id,
      amount: finalPaymentAmount,
      currency: fee.currency || 'INR',
      status: 'completed',
      paymentMethod: gateway,
      transactionId: finalTransactionId,
      gatewayTransactionId: paymentId,
      gatewayResponse,
      description: `Payment for ${fee.description}`,
      metadata: {
        gateway,
        feeType: fee.feeType,
        dueDate: fee.dueDate,
        orderId,
      },
    });

    await transaction.save();

    // Update fee
    const newPaidAmount = (fee.paidAmount || 0) + finalPaymentAmount;
    fee.paidAmount = newPaidAmount;
    fee.status = newPaidAmount >= fee.amount ? 'paid' : 'partial';
    fee.paidAt = new Date();
    fee.paymentMethod = gateway;
    fee.transactionId = finalTransactionId;

    await fee.save();

    // Send payment confirmation notification
    await notificationService.sendPaymentConfirmation(fee, transaction);

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      data: {
        fee,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Bulk create fees for multiple students
exports.bulkCreateFees = async (req, res) => {
  try {
    const { studentIds, feeData } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required',
      });
    }

    if (!feeData || typeof feeData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Fee data is required',
      });
    }

    const createdFees = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        // Find user by studentId or email
        const user = await User.findOne({
          $or: [
            { studentId: studentId },
            { email: studentId }
          ]
        });

        if (!user) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        if (user.role !== 'student') {
          errors.push({ studentId, error: 'User is not a student' });
          continue;
        }

        const fee = new Fee({
          ...feeData,
          userId: user._id
        });

        await fee.save();
        await fee.populate([{ path: 'userId', select: 'name email studentId' }]);

        createdFees.push(fee);

        // Send notification to student
        const notification = new Notification({
          userId: user._id,
          title: 'New Fee Assigned',
          message: `A new fee of ₹${fee.amount} for ${fee.description} has been assigned to you. Due date: ${new Date(fee.dueDate).toLocaleDateString()}.`,
          type: 'warning',
          category: 'fee',
          priority: 'high',
          actionUrl: '/student/fees',
          actionText: 'View Fee Details',
          data: {
            feeId: fee._id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            feeType: fee.feeType
          },
          createdBy: req.user && req.user.id
        });

        await notification.save();

        // Emit real-time notification
        if (global.io) {
          global.io.to(`user_${user._id}`).emit('notification', {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            actionText: notification.actionText,
            data: notification.data,
            createdAt: notification.createdAt
          });
        }

      } catch (error) {
        errors.push({ studentId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Successfully created ${createdFees.length} fees. ${errors.length} errors occurred.`,
      data: {
        createdFees,
        errors,
        summary: {
          total: studentIds.length,
          successful: createdFees.length,
          failed: errors.length
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk fees',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Apply discount or waiver to fee
exports.applyDiscountOrWaiver = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, reason, percentage } = req.body; // type: 'discount' or 'waiver'

    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    if (type === 'discount') {
      if (percentage !== undefined) {
        // Percentage discount
        fee.discountAmount = (fee.amount * percentage) / 100;
        fee.discountType = 'percentage';
      } else {
        // Fixed discount
        fee.discountAmount = amount;
        fee.discountType = 'fixed';
      }
      fee.discountReason = reason;
    } else if (type === 'waiver') {
      fee.waiverAmount = amount;
      fee.waiverReason = reason;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "discount" or "waiver"',
      });
    }

    await fee.save();
    await fee.populate([{ path: 'userId', select: 'name email studentId' }]);

    // Send notification to student
    const user = await User.findById(fee.userId);
    if (user) {
      const notification = new Notification({
        userId: user._id,
        title: type === 'discount' ? 'Fee Discount Applied' : 'Fee Waiver Applied',
        message: `${type === 'discount' ? 'A discount' : 'A waiver'} of ₹${type === 'discount' ? fee.discountAmount : fee.waiverAmount} has been applied to your ${fee.description} fee.`,
        type: 'info',
        category: 'fee',
        priority: 'medium',
        actionUrl: '/student/fees',
        actionText: 'View Fee Details',
        data: {
          feeId: fee._id,
          discountAmount: fee.discountAmount,
          waiverAmount: fee.waiverAmount,
          reason: type === 'discount' ? fee.discountReason : fee.waiverReason
        },
        createdBy: req.user && req.user.id
      });

      await notification.save();

      if (global.io) {
        global.io.to(`user_${user._id}`).emit('notification', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          actionText: notification.actionText,
          data: notification.data,
          createdAt: notification.createdAt
        });
      }
    }

    res.json({
      success: true,
      message: `${type === 'discount' ? 'Discount' : 'Waiver'} applied successfully`,
      data: { fee },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply discount or waiver',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get fee statistics and reports
exports.getFeeReports = async (req, res) => {
  try {
    const { startDate, endDate, status, feeType, academicYear } = req.query;

    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (status) matchQuery.status = status;
    if (feeType) matchQuery.feeType = feeType;
    if (academicYear) matchQuery.academicYear = academicYear;

    // Get fee summary
    const feeSummary = await Fee.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          totalWaiver: { $sum: '$waiverAmount' },
        },
      },
    ]);

    // Get payment summary
    const paymentSummary = await Transaction.aggregate([
      {
        $lookup: {
          from: 'fees',
          localField: 'feeId',
          foreignField: '_id',
          as: 'fee',
        },
      },
      { $unwind: '$fee' },
      { $match: { ...matchQuery, 'fee.userId': { $exists: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Get overdue fees
    const overdueFees = await Fee.countDocuments({
      ...matchQuery,
      status: { $in: ['pending', 'partial', 'overdue'] },
      dueDate: { $lt: new Date() },
    });

    // Get upcoming fees
    const upcomingFees = await Fee.countDocuments({
      ...matchQuery,
      status: 'pending',
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      data: {
        feeSummary,
        paymentSummary,
        overdueFees,
        upcomingFees,
        dateRange: {
          startDate,
          endDate,
        },
        filters: {
          status,
          feeType,
          academicYear,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate fee reports',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Export fee data to CSV
exports.exportFeesToCSV = async (req, res) => {
  try {
    const { startDate, endDate, status, feeType, academicYear } = req.query;

    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (status) matchQuery.status = status;
    if (feeType) matchQuery.feeType = feeType;
    if (academicYear) matchQuery.academicYear = academicYear;

    const fees = await Fee.find(matchQuery)
      .populate('userId', 'name email studentId')
      .sort('-createdAt');

    // Generate CSV content
    const csvHeaders = [
      'Student Name',
      'Student ID',
      'Email',
      'Fee Type',
      'Description',
      'Amount',
      'Paid Amount',
      'Balance',
      'Discount',
      'Waiver',
      'Status',
      'Due Date',
      'Created Date',
      'Academic Year',
      'Semester'
    ];

    const csvRows = fees.map(fee => [
      fee.userId?.name || 'N/A',
      fee.userId?.studentId || 'N/A',
      fee.userId?.email || 'N/A',
      fee.feeType,
      fee.description,
      fee.amount,
      fee.paidAmount || 0,
      (fee.amount - (fee.paidAmount || 0) - (fee.discountAmount || 0) - (fee.waiverAmount || 0)),
      fee.discountAmount || 0,
      fee.waiverAmount || 0,
      fee.status,
      fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A',
      new Date(fee.createdAt).toLocaleDateString(),
      fee.academicYear || 'N/A',
      fee.semester || 'N/A'
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fees-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export fees to CSV',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Export fee data to Excel
exports.exportFeesToExcel = async (req, res) => {
  try {
    const { startDate, endDate, status, feeType, academicYear } = req.query;
    const XLSX = require('xlsx');

    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (status) matchQuery.status = status;
    if (feeType) matchQuery.feeType = feeType;
    if (academicYear) matchQuery.academicYear = academicYear;

    const fees = await Fee.find(matchQuery)
      .populate('userId', 'name email studentId')
      .sort('-createdAt');

    // Prepare data for Excel
    const excelData = fees.map(fee => ({
      'Student Name': fee.userId?.name || 'N/A',
      'Student ID': fee.userId?.studentId || 'N/A',
      'Email': fee.userId?.email || 'N/A',
      'Fee Type': fee.feeType,
      'Description': fee.description,
      'Amount': fee.amount,
      'Paid Amount': fee.paidAmount || 0,
      'Balance': (fee.amount - (fee.paidAmount || 0) - (fee.discountAmount || 0) - (fee.waiverAmount || 0)),
      'Discount': fee.discountAmount || 0,
      'Waiver': fee.waiverAmount || 0,
      'Status': fee.status,
      'Due Date': fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A',
      'Created Date': new Date(fee.createdAt).toLocaleDateString(),
      'Academic Year': fee.academicYear || 'N/A',
      'Semester': fee.semester || 'N/A',
      'Currency': fee.currency || 'INR',
      'Priority': fee.priority || 'medium',
      'Category': fee.category || 'academic'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Student Name
      { wch: 12 }, // Student ID
      { wch: 25 }, // Email
      { wch: 10 }, // Fee Type
      { wch: 30 }, // Description
      { wch: 10 }, // Amount
      { wch: 12 }, // Paid Amount
      { wch: 10 }, // Balance
      { wch: 10 }, // Discount
      { wch: 10 }, // Waiver
      { wch: 10 }, // Status
      { wch: 12 }, // Due Date
      { wch: 12 }, // Created Date
      { wch: 12 }, // Academic Year
      { wch: 10 }, // Semester
      { wch: 8 },  // Currency
      { wch: 8 },  // Priority
      { wch: 12 }  // Category
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fees Report');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=fees-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export fees to Excel',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get payment gateway configuration
exports.getPaymentGatewayConfig = async (req, res) => {
  try {
    // Return available payment methods and gateway configurations
    const config = {
      gateways: {
        razorpay: {
          enabled: paymentService.isRazorpayConfigured(),
          keyId: paymentService.isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : null,
        },
        stripe: {
          enabled: paymentService.isStripeConfigured(),
          publishableKey: paymentService.isStripeConfigured() ? process.env.STRIPE_PUBLISHABLE_KEY : null,
        },
        paypal: {
          enabled: paymentService.isPaypalConfigured(),
          clientId: paymentService.isPaypalConfigured() ? process.env.PAYPAL_CLIENT_ID : null,
          mode: process.env.PAYPAL_MODE || 'sandbox',
        },
        manual: {
          enabled: true, // Always available as fallback
        },
      },
      methods: [
        { id: 'card', name: 'Credit/Debit Card', enabled: true },
        { id: 'upi', name: 'UPI', enabled: true },
        { id: 'bank_transfer', name: 'Bank Transfer', enabled: true },
        { id: 'wallet', name: 'Digital Wallet', enabled: true },
        { id: 'cash', name: 'Cash Payment', enabled: true },
        { id: 'netbanking', name: 'Net Banking', enabled: true },
      ],
      currencies: ['INR', 'USD', 'EUR', 'GBP'],
    };

    res.json({
      success: true,
      data: { config },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get payment configuration',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};