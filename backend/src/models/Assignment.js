const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignmentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor ID is required'],
  },
  type: {
    type: String,
    enum: ['homework', 'project', 'quiz', 'lab', 'presentation'],
    default: 'homework',
  },
  content: {
    type: String,
    required: [true, 'Assignment content is required'],
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
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    min: 1,
  },
  weightage: {
    type: Number,
    default: 1,
    min: 0,
    max: 1,
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  gracePeriod: {
    type: Number, // in hours
    default: 24,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'graded'],
    default: 'draft',
  },
  instructions: {
    type: String,
    trim: true,
  },
  rubric: [{
    criteria: String,
    description: String,
    marks: Number,
  }],
  settings: {
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    maxFileSize: {
      type: Number, // in MB
      default: 10,
    },
    allowedFileTypes: [{
      type: String,
      trim: true,
    }],
    plagiarismCheck: {
      type: Boolean,
      default: false,
    },
    autoGrading: {
      type: Boolean,
      default: false,
    },
  },
  submissionCount: {
    type: Number,
    default: 0,
  },
  gradedCount: {
    type: Number,
    default: 0,
  },
  publishedAt: Date,
  closedAt: Date,
}, {
  timestamps: true,
});

// Index for better performance
AssignmentSchema.index({ courseId: 1, deadline: 1 });
AssignmentSchema.index({ instructorId: 1, status: 1 });
AssignmentSchema.index({ status: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);