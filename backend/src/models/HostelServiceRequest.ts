import mongoose, { Document, Schema } from 'mongoose';

export interface IHostelServiceRequest extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  type: 'maintenance' | 'cleaning' | 'pest_control' | 'electrical' | 'plumbing' | 'furniture' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'cancelled';
  images?: string[];
  assignedTo?: mongoose.Types.ObjectId;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: Date;
  };
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HostelServiceRequestSchema = new Schema<IHostelServiceRequest>({
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
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['maintenance', 'cleaning', 'pest_control', 'electrical', 'plumbing', 'furniture', 'other'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'cancelled'],
    default: 'submitted',
    index: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative'],
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
  },
  scheduledDate: {
    type: Date,
    validate: {
      validator: function(this: IHostelServiceRequest, value: Date) {
        return !value || value >= new Date();
      },
      message: 'Scheduled date cannot be in the past',
    },
  },
  completedDate: {
    type: Date,
  },
  feedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
HostelServiceRequestSchema.index({ userId: 1, status: 1 });
HostelServiceRequestSchema.index({ roomId: 1, status: 1 });
HostelServiceRequestSchema.index({ type: 1, priority: 1 });
HostelServiceRequestSchema.index({ assignedTo: 1, status: 1 });
HostelServiceRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to validate status transitions and auto-set dates
HostelServiceRequestSchema.pre('save', function(next) {
  // Auto-set completion date when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.completedDate) {
    this.completedDate = new Date();
  }

  // Validate that feedback can only be given for resolved requests
  if (this.feedback && this.status !== 'resolved') {
    return next(new Error('Feedback can only be given for resolved requests'));
  }

  next();
});

// Virtual for response time (time from submission to acknowledgment)
HostelServiceRequestSchema.virtual('responseTime').get(function(this: IHostelServiceRequest) {
  if (this.status === 'submitted') return null;
  
  // Assuming acknowledgment happens when status changes from submitted
  // This is a simplified calculation
  return null; // Would need additional tracking for exact acknowledgment time
});

// Virtual for resolution time
HostelServiceRequestSchema.virtual('resolutionTime').get(function(this: IHostelServiceRequest) {
  if (!this.completedDate) return null;
  
  const diffTime = this.completedDate.getTime() - this.createdAt.getTime();
  return Math.round(diffTime / (1000 * 60 * 60)); // Hours
});

// Method to check if request can be cancelled
HostelServiceRequestSchema.methods.canCancel = function(this: IHostelServiceRequest): boolean {
  return this.status === 'submitted' || this.status === 'acknowledged';
};

// Method to check if request can be assigned
HostelServiceRequestSchema.methods.canAssign = function(this: IHostelServiceRequest): boolean {
  return this.status !== 'resolved' && this.status !== 'cancelled';
};

// Static method to get user's service request summary
HostelServiceRequestSchema.statics.getUserSummary = function(userId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: { $ifNull: ['$actualCost', 0] } },
      },
    },
  ]);
};

// Static method to get room-wise service requests
HostelServiceRequestSchema.statics.getRoomSummary = function(roomId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { roomId } },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status',
        },
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$completedDate', null] },
              {
                $divide: [
                  { $subtract: ['$completedDate', '$createdAt'] },
                  1000 * 60 * 60, // Convert to hours
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

export default mongoose.model<IHostelServiceRequest>('HostelServiceRequest', HostelServiceRequestSchema);