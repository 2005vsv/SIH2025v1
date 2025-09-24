const mongoose = require('mongoose');
const { Schema } = mongoose;

const BorrowRecordSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required'],
    index: true,
  },
  borrowDate: {
    type: Date,
    required: [true, 'Borrow date is required'],
    default: Date.now,
    index: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function (value) {
        return value > this.borrowDate;
      },
      message: 'Due date must be after borrow date',
    },
    index: true,
  },
  returnDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= this.borrowDate;
      },
      message: 'Return date cannot be before borrow date',
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['borrowed', 'returned', 'overdue', 'lost', 'damaged'],
    default: 'borrowed',
    index: true,
  },
  renewalCount: {
    type: Number,
    default: 0,
    min: [0, 'Renewal count cannot be negative'],
  },
  maxRenewals: {
    type: Number,
    default: 2,
    min: [0, 'Max renewals cannot be negative'],
  },
  fineAmount: {
    type: Number,
    default: 0,
    min: [0, 'Fine amount cannot be negative'],
  },
  finePaid: {
    type: Number,
    default: 0,
  },
  condition: {
    type: String,
    required: true,
    enum: ['good', 'fair', 'poor', 'damaged'],
    default: 'good',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  qrCodeScanned: {
    type: Boolean,
    default: false,
  },
  librarian: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes for better query performance
BorrowRecordSchema.index({ userId: 1, status: 1 });
BorrowRecordSchema.index({ bookId: 1, status: 1 });
BorrowRecordSchema.index({ dueDate: 1, status: 1 });
BorrowRecordSchema.index({ borrowDate: -1 });

// Pre-save middleware to calculate fine and update status
BorrowRecordSchema.pre('save', function (next) {
  const now = new Date();

  // Auto-update status to overdue if past due date
  if (this.status === 'borrowed' && this.dueDate < now) {
    this.status = 'overdue';
  }

  // Calculate fine for overdue books
  if (this.status === 'overdue' || (this.status === 'returned' && this.returnDate && this.returnDate > this.dueDate)) {
    const daysOverdue = this.returnDate
      ? Math.ceil((this.returnDate.getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : Math.ceil((now.getTime() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
      const finePerDay = 5; // ₹5 per day
      this.fineAmount = Math.max(this.fineAmount, daysOverdue * finePerDay);
    }
  }

  // Set return date when status changes to returned
  if (this.isModified('status') && this.status === 'returned' && !this.returnDate) {
    this.returnDate = now;
  }

  next();
});

// Virtual for days borrowed
BorrowRecordSchema.virtual('daysBorrowed').get(function () {
  const endDate = this.returnDate || new Date();
  const diffTime = endDate.getTime() - this.borrowDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days overdue
BorrowRecordSchema.virtual('daysOverdue').get(function () {
  const now = new Date();
  const checkDate = this.returnDate || now;

  if (checkDate <= this.dueDate) return 0;

  const diffTime = checkDate.getTime() - this.dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for can renew
BorrowRecordSchema.virtual('canRenew').get(function () {
  return this.status === 'borrowed' &&
    this.renewalCount < this.maxRenewals &&
    this.fineAmount === 0;
});

// Method to renew the book
BorrowRecordSchema.methods.renew = function (days = 14) {
  const canRenewCheck = this.status === 'borrowed' &&
    this.renewalCount < this.maxRenewals &&
    this.fineAmount === 0;

  if (!canRenewCheck) return false;

  this.dueDate = new Date(this.dueDate.getTime() + (days * 24 * 60 * 60 * 1000));
  this.renewalCount += 1;
  return true;
};

// Method to return the book
BorrowRecordSchema.methods.returnBook = function (condition = 'good') {
  this.returnDate = new Date();
  this.status = 'returned';
  this.condition = condition;
};

// Static method to find overdue books
BorrowRecordSchema.statics.findOverdue = function () {
  return this.find({
    status: 'borrowed',
    dueDate: { $lt: new Date() },
  }).populate('userId bookId');
};

// Static method to get user's borrowing statistics
BorrowRecordSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalFine: { $sum: '$fineAmount' },
      },
    },
  ]);
};

// Static method to get book borrowing statistics
BorrowRecordSchema.statics.getBookStats = function (bookId) {
  return this.aggregate([
    { $match: { bookId } },
    {
      $group: {
        _id: '$status',
        totalBorrows: { $sum: 1 },
        currentlyBorrowed: {
          $sum: { $cond: [{ $eq: ['$status', 'borrowed'] }, 1, 0] },
        },
        averageBorrowDays: {
          $avg: {
            $cond: [
              { $ne: ['$returnDate', null] },
              {
                $divide: [
                  { $subtract: ['$returnDate', '$borrowDate'] },
                  1000 * 60 * 60 * 24,
                ],
              },
              null,
            ],
          },
        },
      },
    },
  ]);
};

module.exports = mongoose.model('BorrowRecord', BorrowRecordSchema);