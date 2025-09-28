const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['tuition', 'hostel', 'library', 'examination', 'other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount must be positive'],
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR',
  },
  paidAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  // Discount and waiver fields
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative'],
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed',
  },
  discountReason: {
    type: String,
    trim: true,
  },
  waiverAmount: {
    type: Number,
    default: 0,
    min: [0, 'Waiver amount cannot be negative'],
  },
  waiverReason: {
    type: String,
    trim: true,
  },
  // Installment support
  installmentPlan: {
    isInstallment: {
      type: Boolean,
      default: false,
    },
    totalInstallments: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 installment'],
    },
    currentInstallment: {
      type: Number,
      default: 1,
      min: [1, 'Current installment must be at least 1'],
    },
    installmentAmount: {
      type: Number,
      default: 0,
    },
  },
  // Additional metadata
  academicYear: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'facility', 'other'],
    default: 'academic',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  // Receipt and notification tracking
  receiptGenerated: {
    type: Boolean,
    default: false,
  },
  lastReminderSent: {
    type: Date,
  },
  reminderCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
FeeSchema.index({ userId: 1 });
FeeSchema.index({ status: 1 });
FeeSchema.index({ dueDate: 1 });
FeeSchema.index({ category: 1 });
FeeSchema.index({ priority: 1 });
FeeSchema.index({ academicYear: 1 });
FeeSchema.index({ 'installmentPlan.isInstallment': 1 });
FeeSchema.index({ receiptGenerated: 1 });

module.exports = mongoose.model('Fee', FeeSchema);