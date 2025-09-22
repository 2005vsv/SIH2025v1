import mongoose, { Document, Schema } from 'mongoose';

export interface IHostelAllocation extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  allocatedDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  status: 'allocated' | 'checked_in' | 'checked_out' | 'cancelled';
  depositPaid: number;
  depositRefunded?: number;
  rentPaid: number;
  bedNumber?: number;
  notes?: string;
  documents?: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const HostelAllocationSchema = new Schema<IHostelAllocation>({
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
      validator: function(this: IHostelAllocation, value: Date) {
        return !value || value >= this.allocatedDate;
      },
      message: 'Check-in date cannot be before allocation date',
    },
  },
  checkOutDate: {
    type: Date,
    validate: {
      validator: function(this: IHostelAllocation, value: Date) {
        return !value || !this.checkInDate || value >= this.checkInDate;
      },
      message: 'Check-out date cannot be before check-in date',
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['allocated', 'checked_in', 'checked_out', 'cancelled'],
    default: 'allocated',
    index: true,
  },
  depositPaid: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [0, 'Deposit cannot be negative'],
  },
  depositRefunded: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    validate: {
      validator: function(this: IHostelAllocation, value: number) {
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

// Pre-save middleware to validate status transitions
HostelAllocationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const validTransitions: Record<string, string[]> = {
      allocated: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const currentStatus = this.status;
    const previousStatus = this.get('status');

    if (previousStatus && !validTransitions[previousStatus]?.includes(currentStatus)) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${currentStatus}`));
    }
  }

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
HostelAllocationSchema.virtual('stayDuration').get(function(this: IHostelAllocation) {
  if (!this.checkInDate) return null;
  
  const endDate = this.checkOutDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - this.checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
});

// Virtual for remaining deposit
HostelAllocationSchema.virtual('remainingDeposit').get(function(this: IHostelAllocation) {
  return this.depositPaid - (this.depositRefunded || 0);
});

// Method to check if allocation is active
HostelAllocationSchema.methods.isActive = function(this: IHostelAllocation): boolean {
  return this.status === 'allocated' || this.status === 'checked_in';
};

// Static method to find current allocations for a user
HostelAllocationSchema.statics.findActiveByUser = function(userId: mongoose.Types.ObjectId) {
  return this.findOne({
    userId,
    status: { $in: ['allocated', 'checked_in'] },
  }).populate('roomId');
};

// Static method to get room occupancy
HostelAllocationSchema.statics.getRoomOccupancy = function(roomId: mongoose.Types.ObjectId) {
  return this.countDocuments({
    roomId,
    status: { $in: ['allocated', 'checked_in'] },
  });
};

export default mongoose.model<IHostelAllocation>('HostelAllocation', HostelAllocationSchema);