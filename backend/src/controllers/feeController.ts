import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/roleCheck';
import Fee from '../models/Fee';
import Transaction from '../models/Transaction';

// Get all fees for current user (Student) or all fees (Admin)
export const getFees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, feeType } = req.query;
    const isAdmin = req.user?.role === 'admin';
    
    const query: any = {};
    
    // Students can only see their own fees
    if (!isAdmin) {
      query.userId = req.user?.id;
    }
    
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: '-createdAt',
      populate: isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [],
    };

    const fees = await Fee.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const getFeeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    
    const query: any = { _id: id };
    
    // Students can only see their own fees
    if (!isAdmin) {
      query.userId = req.user?.id;
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
export const createFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    
    await fee.populate([{ path: 'userId', select: 'name email studentId' }]);

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
export const updateFee = async (req: Request, res: Response): Promise<void> => {
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
export const deleteFee = async (req: Request, res: Response): Promise<void> => {
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
export const makePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'online', transactionId } = req.body;
    const userId = req.user?.id;

    const fee = await Fee.findById(id);
    
    if (!fee) {
      res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
      return;
    }

    // Check if user can pay this fee
    if (req.user?.role !== 'admin' && fee.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only pay your own fees',
      });
      return;
    }

    if (fee.status === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Fee is already paid',
      });
      return;
    }

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      type: 'debit',
      amount: fee.amount,
      description: `Payment for ${fee.description}`,
      category: 'fees',
      reference: {
        model: 'Fee',
        id: fee._id,
      },
      paymentMethod,
      transactionId: transactionId || `TXN${Date.now()}`,
      status: 'completed',
    });

    await transaction.save();

    // Update fee payment status
    fee.status = 'paid';
    fee.paidAt = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId || `TXN${Date.now()}`;

    await fee.save();

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
export const getFeeSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    let matchQuery: any = {};
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

    const overdueFees = await Fee.find({
      ...matchQuery,
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() },
    }).countDocuments();

    const upcomingFees = await Fee.find({
      ...matchQuery,
      status: 'pending',
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }).countDocuments();

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
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, fromDate, toDate } = req.query;
    const isAdmin = req.user?.role === 'admin';
    
    const query: any = { status: 'completed' };
    
    // Students can only see their own payment history
    if (!isAdmin) {
      const userFees = await Fee.find({ userId: req.user?.id }).select('_id');
      const feeIds = userFees.map(fee => fee._id);
      query.feeId = { $in: feeIds };
    }
    
    if (status) query.status = status;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate as string);
      if (toDate) query.createdAt.$lte = new Date(toDate as string);
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: '-createdAt',
    };

    const payments = await Transaction.find(query)
      .populate('feeId', 'feeType description amount')
      .populate('userId', 'name email studentId')
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const getPaymentReceipt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    
    const payment = await Transaction.findById(id)
      .populate('feeId', 'feeType description amount dueDate')
      .populate('userId', 'name email studentId profile.department');

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    // Students can only access their own receipts
    if (!isAdmin && payment.userId._id.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Generate receipt data
    const receipt = {
      receiptNumber: `RCP-${payment._id}`,
      paymentDate: payment.createdAt,
      student: {
        name: (payment.userId as any).name,
        email: (payment.userId as any).email,
        studentId: (payment.userId as any).studentId,
        department: (payment.userId as any).profile?.department,
      },
      fee: {
        type: (payment.feeId as any).feeType,
        description: (payment.feeId as any).description,
        amount: payment.amount,
        dueDate: (payment.feeId as any).dueDate,
      },
      payment: {
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status,
        paidAt: payment.createdAt,
      },
    };

    res.json({
      success: true,
      data: { receipt },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};