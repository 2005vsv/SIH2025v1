const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationPreferenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  email: {
    enabled: {
      type: Boolean,
      default: true,
    },
    hostel: {
      type: Boolean,
      default: true,
    },
    fee: {
      type: Boolean,
      default: true,
    },
    academic: {
      type: Boolean,
      default: true,
    },
    library: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: Boolean,
      default: true,
    },
  },
  sms: {
    enabled: {
      type: Boolean,
      default: false,
    },
    hostel: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Boolean,
      default: false,
    },
    urgent: {
      type: Boolean,
      default: true,
    },
  },
  push: {
    enabled: {
      type: Boolean,
      default: true,
    },
    hostel: {
      type: Boolean,
      default: true,
    },
    fee: {
      type: Boolean,
      default: true,
    },
    academic: {
      type: Boolean,
      default: true,
    },
    library: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: Boolean,
      default: true,
    },
  },
  inApp: {
    enabled: {
      type: Boolean,
      default: true,
    },
    sound: {
      type: Boolean,
      default: true,
    },
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: false,
    },
    start: {
      type: String,
      default: '22:00',
    },
    end: {
      type: String,
      default: '08:00',
    },
  },
}, {
  timestamps: true,
});

// Pre-save middleware to create default preferences for new users
NotificationPreferenceSchema.pre('save', function(next) {
  if (this.isNew) {
    // Ensure all nested objects exist with defaults
    this.email = { ...this.email };
    this.sms = { ...this.sms };
    this.push = { ...this.push };
    this.inApp = { ...this.inApp };
    this.quietHours = { ...this.quietHours };
  }
  next();
});

module.exports = mongoose.model('NotificationPreference', NotificationPreferenceSchema);