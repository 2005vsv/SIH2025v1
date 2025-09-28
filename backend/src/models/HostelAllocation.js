const mongoose = require('mongoose');
const { Schema } = mongoose;

const HostelAllocationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'HostelRoom',
    required: [true, 'Room ID is required'],
    index: true,
  },
  allocatedDate: {
    type: Date,
    required: [true, 'Allocation date is required'],
    default: Date.now,
    index: true,
  },
  checkInDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= this.allocatedDate;
      },
      message: 'Check-in date cannot be before allocation date',
    },
  },
  checkOutDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || !this.checkInDate || value >= this.checkInDate;
      },
      message: 'Check-out date cannot be before check-in date',
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'allocated', 'checked_in', 'checked_out', 'cancelled'],
    default: 'pending',
    index: true,
  },
  depositPaid: {
    type: Number,
    required: function() {
      return this.status !== 'pending';
    },
    min: [0, 'Deposit cannot be negative'],
    default: 0,
  },
  depositRefunded: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    validate: {
      validator: function (value) {
        return !value || value <= this.depositPaid;
      },
      message: 'Refund amount cannot exceed deposit paid',
    },
  },
  rentPaid: {
    type: Number,
    default: 0,
    min: [0, 'Rent cannot be negative'],
  },
  bedNumber: {
    type: Number,
    min: [1, 'Bed number must be positive'],
    max: [4, 'Bed number cannot exceed 4'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['id_proof', 'address_proof', 'medical_certificate', 'photo', 'other'],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Compound indexes for better query performance
HostelAllocationSchema.index({ userId: 1, status: 1 });
HostelAllocationSchema.index({ roomId: 1, status: 1 });
HostelAllocationSchema.index({ allocatedDate: -1 });
HostelAllocationSchema.index({ userId: 1, roomId: 1 }, { unique: true });

// Pre-save middleware to auto-set dates based on status
HostelAllocationSchema.pre('save', function (next) {
  // Auto-set dates based on status
  if (this.status === 'checked_in' && !this.checkInDate) {
    this.checkInDate = new Date();
  }
  if (this.status === 'checked_out' && !this.checkOutDate) {
    this.checkOutDate = new Date();
  }

  next();
});

// Virtual for duration of stay
HostelAllocationSchema.virtual('stayDuration').get(function () {
  if (!this.checkInDate) return null;

  const endDate = this.checkOutDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for remaining deposit
HostelAllocationSchema.virtual('remainingDeposit').get(function () {
  return this.depositPaid - (this.depositRefunded || 0);
});

// Method to check if allocation is active
HostelAllocationSchema.methods.isActive = function () {
  return this.status === 'allocated' || this.status === 'checked_in';
};

// Static method to find current allocations for a user
HostelAllocationSchema.statics.findActiveByUser = function (userId) {
  return this.findOne({
    userId,
    status: { $in: ['allocated', 'checked_in'] },
  }).populate('roomId');
};

// Static method to get room occupancy
HostelAllocationSchema.statics.getRoomOccupancy = function (roomId) {
  return this.countDocuments({
    roomId,
    status: { $in: ['allocated', 'checked_in'] },
  });
};

module.exports = mongoose.model('HostelAllocation', HostelAllocationSchema);