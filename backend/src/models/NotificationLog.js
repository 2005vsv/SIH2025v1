const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationLogSchema = new Schema({
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'push', 'inApp'],
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'complained'],
    default: 'pending',
    index: true,
  },
  provider: {
    type: String,
    enum: ['sendgrid', 'twilio', 'firebase', 'socket.io'],
    required: true,
  },
  providerMessageId: {
    type: String,
    index: true,
  },
  recipient: {
    type: String,
    required: true, // email, phone, or user ID for push
  },
  subject: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  error: {
    message: String,
    code: String,
    details: Schema.Types.Mixed,
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3,
  },
  nextRetryAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  cost: {
    type: Number,
    default: 0,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
NotificationLogSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationLogSchema.index({ status: 1, type: 1, createdAt: -1 });
NotificationLogSchema.index({ provider: 1, status: 1 });
NotificationLogSchema.index({ nextRetryAt: 1 }, { sparse: true });

// Pre-save middleware to set sentAt when status changes to sent
NotificationLogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  next();
});

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);