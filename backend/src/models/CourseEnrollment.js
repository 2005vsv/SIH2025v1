const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseEnrollmentSchema = new Schema({
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
  status: {
    type: String,
    enum: ['enrolled', 'dropped', 'completed'],
    default: 'enrolled',
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  droppedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound index to ensure a student can't enroll in the same course twice
CourseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Index for better performance
CourseEnrollmentSchema.index({ studentId: 1, status: 1 });
CourseEnrollmentSchema.index({ courseId: 1 });

module.exports = mongoose.model('CourseEnrollment', CourseEnrollmentSchema);