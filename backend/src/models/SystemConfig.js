const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  // General settings
  general: {
    siteName: { type: String, default: 'Student Portal' },
    siteUrl: { type: String, default: 'https://portal.university.edu' },
    adminEmail: { type: String, default: 'admin@university.edu' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    currency: { type: String, default: 'INR' }
  },

  // Notification settings
  notifications: {
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: false },
    defaultTemplate: { type: String, default: 'default' }
  },

  // Security settings
  security: {
    sessionTimeout: { type: Number, default: 30 },
    maxLoginAttempts: { type: Number, default: 5 },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true }
    }
  },

  // Academic settings
  academic: {
    currentSemester: { type: String, default: 'Fall 2025' },
    academicYear: { type: String, default: '2025-26' },
    semesterStartDate: { type: String, default: '2025-08-01' },
    semesterEndDate: { type: String, default: '2025-12-15' }
  },

  // Fee settings
  fees: {
    latePaymentFee: { type: Number, default: 100 },
    gracePeriodDays: { type: Number, default: 7 },
    paymentMethods: { type: [String], default: ['online', 'bank_transfer', 'cash'] }
  },

  // Library settings
  library: {
    maxBooksPerStudent: { type: Number, default: 5 },
    borrowDurationDays: { type: Number, default: 14 },
    renewalLimit: { type: Number, default: 2 },
    finePerDay: { type: Number, default: 10 }
  }
}, {
  timestamps: true,
  // Ensure only one document exists
  collection: 'systemconfig'
});

// Static method to get the single config document
systemConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

// Static method to update config
systemConfigSchema.statics.updateConfig = async function(updates) {
  let config = await this.findOne();
  if (!config) {
    config = await this.create(updates);
  } else {
    // Deep merge the updates
    const mergeObjects = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          mergeObjects(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    mergeObjects(config, updates);
    await config.save();
  }
  return config;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);