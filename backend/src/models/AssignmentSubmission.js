const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignmentSubmissionSchema = new Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  content: {
    type: String,
    trim: true,
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
    default: 'submitted',
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  lateHours: {
    type: Number,
    default: 0,
  },
  grade: {
    marks: {
      type: Number,
      min: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
  },
  plagiarismScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  plagiarismReport: {
    type: String,
    trim: true,
  },
  rubricScores: [{
    criteria: String,
    score: Number,
    maxScore: Number,
    comments: String,
  }],
  attempts: {
    type: Number,
    default: 1,
  },
  versionHistory: [{
    version: Number,
    content: String,
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: Date,
    }],
    submittedAt: Date,
  }],
}, {
  timestamps: true,
});

// Compound index to prevent duplicate submissions
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// Index for better query performance
AssignmentSubmissionSchema.index({ courseId: 1, status: 1 });
AssignmentSubmissionSchema.index({ studentId: 1, submittedAt: -1 });
AssignmentSubmissionSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);