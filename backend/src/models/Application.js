const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true,
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume is required'],
    trim: true,
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    required: true,
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'],
    default: 'applied',
    index: true,
  },
  appliedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  interviewDate: {
    type: Date,
  },
  interviewMode: {
    type: String,
    enum: ['online', 'offline', 'telephonic'],
  },
  interviewLink: {
    type: String,
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
  },
  additionalDocuments: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);