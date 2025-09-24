const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificateSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: ['degree', 'diploma', 'course_completion', 'participation', 'achievement', 'transcript'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now,
    index: true,
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > this.issueDate;
      },
      message: 'Valid until date must be after issue date',
    },
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
    trim: true,
  },
  verificationHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  metadata: {
    course: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100'],
    },
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  revokedAt: {
    type: Date,
  },
  revokedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  revokeReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Revoke reason cannot exceed 500 characters'],
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative'],
  },
  verificationCount: {
    type: Number,
    default: 0,
    min: [0, 'Verification count cannot be negative'],
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

CertificateSchema.index({ userId: 1, type: 1 });
CertificateSchema.index({ issueDate: -1 });
CertificateSchema.index({ isRevoked: 1, type: 1 });

// Pre-save middleware to generate certificate number
CertificateSchema.pre('save', function (next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    this.certificateNumber = `CERT${year}${random}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);