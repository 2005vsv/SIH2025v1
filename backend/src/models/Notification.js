const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    required: true,
    enum: ['info', 'success', 'warning', 'error', 'reminder', 'achievement'],
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['system', 'fee', 'exam', 'library', 'hostel', 'placement', 'certificate', 'gamification'],
    index: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  actionUrl: {
    type: String,
    trim: true,
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters'],
  },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ category: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, createdAt: -1 });

// Pre-save middleware to set readAt when isRead changes to true
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);