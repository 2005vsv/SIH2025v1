const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  feeId: {
    type: Schema.Types.ObjectId,
    ref: 'Fee',
    required: [true, 'Fee ID is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    uppercase: true,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'upi', 'wallet', 'cash'],
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  gatewayTransactionId: {
    type: String,
    sparse: true,
    index: true,
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  receiptUrl: {
    type: String,
    trim: true,
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount must be positive'],
    validate: {
      validator: function (value) {
        return !value || value <= this.amount;
      },
      message: 'Refund amount cannot exceed transaction amount',
    },
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters'],
  },
  refundedAt: {
    type: Date,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ feeId: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ transactionId: 1, gatewayTransactionId: 1 });

// Pre-save middleware to generate transaction ID
TransactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Ensure refund data consistency
TransactionSchema.pre('save', function (next) {
  if (this.status === 'refunded') {
    if (!this.refundAmount || !this.refundedAt) {
      return next(new Error('Refund amount and date are required for refunded transactions'));
    }
  }
  next();
});

// Virtual for net amount (after refunds)
TransactionSchema.virtual('netAmount').get(function () {
  return this.amount - (this.refundAmount || 0);
});

// Method to check if transaction can be refunded
TransactionSchema.methods.canRefund = function () {
  return this.status === 'completed' && (!this.refundAmount || this.refundAmount < this.amount);
};

// Static method to get user transaction summary
TransactionSchema.statics.getUserSummary = function (userId) {
  return this.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
};

module.exports = mongoose.model('Transaction', TransactionSchema);