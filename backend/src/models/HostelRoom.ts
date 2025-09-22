import mongoose, { Document, Schema } from 'mongoose';

export interface IHostelRoom extends Document {
  roomNumber: string;
  block: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  rent: number;
  deposit: number;
  isActive: boolean;
  maintenanceStatus: 'good' | 'needs_repair' | 'under_maintenance' | 'out_of_order';
  description?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  isAvailable: boolean;
  availableSpots: number;
  // Methods
  canAccommodate(count?: number): boolean;
}

const HostelRoomSchema = new Schema<IHostelRoom>({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true,
    index: true,
  },
  block: {
    type: String,
    required: [true, 'Block is required'],
    trim: true,
    uppercase: true,
    index: true,
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: [0, 'Floor cannot be negative'],
    max: [50, 'Floor cannot exceed 50'],
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'quad'],
    index: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    max: [4, 'Capacity cannot exceed 4'],
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Occupancy cannot be negative'],
    validate: {
      validator: function(this: IHostelRoom, value: number) {
        return value <= this.capacity;
      },
      message: 'Current occupancy cannot exceed room capacity',
    },
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  rent: {
    type: Number,
    required: [true, 'Rent is required'],
    min: [0, 'Rent cannot be negative'],
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit is required'],
    min: [0, 'Deposit cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  maintenanceStatus: {
    type: String,
    required: true,
    enum: ['good', 'needs_repair', 'under_maintenance', 'out_of_order'],
    default: 'good',
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  images: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes for better query performance
HostelRoomSchema.index({ block: 1, floor: 1 });
HostelRoomSchema.index({ type: 1, isActive: 1 });
HostelRoomSchema.index({ maintenanceStatus: 1, isActive: 1 });

// Virtual for availability
HostelRoomSchema.virtual('isAvailable').get(function(this: IHostelRoom) {
  return this.isActive && 
         this.maintenanceStatus === 'good' && 
         this.currentOccupancy < this.capacity;
});

// Virtual for available spots
HostelRoomSchema.virtual('availableSpots').get(function(this: IHostelRoom) {
  return this.capacity - this.currentOccupancy;
});

// Method to check if room can accommodate more students
HostelRoomSchema.methods.canAccommodate = function(this: IHostelRoom, count: number = 1): boolean {
  return this.isActive && 
         this.maintenanceStatus === 'good' && 
         (this.capacity - this.currentOccupancy) >= count;
};

// Static method to find available rooms
HostelRoomSchema.statics.findAvailable = function(criteria: any = {}) {
  return this.find({
    isActive: true,
    maintenanceStatus: 'good',
    $expr: { $lt: ['$currentOccupancy', '$capacity'] },
    ...criteria,
  });
};

export default mongoose.model<IHostelRoom>('HostelRoom', HostelRoomSchema);